// Share in-flight requests across public forms and suppress accidental resubmits.
export function createContactSubmitter(send = (...args) => fetch(...args), now = () => Date.now()) {
  const requests = new Map();
  return function submitContact(payload) {
    const key = JSON.stringify(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)));
    for (const [entryKey, entry] of requests) {
      if (entry.expires <= now()) requests.delete(entryKey);
    }
    if (requests.has(key)) return requests.get(key).promise;
    const entry = { expires: Infinity };
    entry.promise = (async () => {
      try {
        const response = await send("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to submit your request. Please try again.");
        entry.expires = now() + 60000;
        return data;
      } catch (error) {
        requests.delete(key);
        throw error;
      }
    })();
    requests.set(key, entry);
    return entry.promise;
  };
}

export const submitContactRequest = createContactSubmitter();
