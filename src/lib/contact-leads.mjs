export const DAILY_CONTACT_DUPLICATE_CODE = "CONTACT_ALREADY_RECEIVED_TODAY";
export const DAILY_CONTACT_DUPLICATE_MESSAGE = "Your query has already been received. Please allow us some time to get back to you!";

export function dailyContactDuplicateError() {
  const error = new Error(DAILY_CONTACT_DUPLICATE_MESSAGE);
  error.code = DAILY_CONTACT_DUPLICATE_CODE;
  return error;
}

export function isDailyContactDuplicate(error) {
  return error?.code === DAILY_CONTACT_DUPLICATE_CODE;
}

// Serialise submissions for one mobile number before checking the IST calendar day.
// The connection must use the +05:30 session timezone so CURDATE() means today in India.
export async function runOncePerContactDay(connection, mobile, insert) {
  const lockName = `contact-lead:${mobile}`;
  const [lockRows] = await connection.execute("SELECT GET_LOCK(?, 5) AS acquired", [lockName]);
  if (Number(lockRows[0]?.acquired) !== 1) {
    throw new Error("Unable to reserve this contact submission.");
  }

  try {
    const [existingRows] = await connection.execute(
      `SELECT id FROM contacts
       WHERE mobile = ?
         AND created_at >= CURDATE()
         AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
       LIMIT 1`,
      [mobile],
    );
    if (existingRows.length) throw dailyContactDuplicateError();
    return await insert();
  } finally {
    await connection.execute("SELECT RELEASE_LOCK(?) AS released", [lockName]);
  }
}

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
