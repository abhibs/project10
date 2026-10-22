// Rows arrive newest first; keep one lead per mobile number and IST date.
export function uniqueDailyContacts(contacts) {
  const seen = new Set();
  return contacts.filter((contact) => {
    const mobile = String(contact.mobile || "").replace(/\D/g, "");
    if (!mobile) return true;
    const key = `${contact.submittedDate}:${mobile}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
