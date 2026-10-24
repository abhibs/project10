// Share only in-flight requests; completed attempts must reach the server-side daily guard.
export function createContactSubmitter(send = (...args) => fetch(...args)) {
  const requests = new Map();
  return function submitContact(payload) {
    const key = JSON.stringify(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)));
    if (requests.has(key)) return requests.get(key);
    const request = (async () => {
      try {
        const response = await send("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to submit your request. Please try again.");
        return data;
      } finally {
        requests.delete(key);
      }
    })();
    requests.set(key, request);
    return request;
  };
}

export const submitContactRequest = createContactSubmitter();
