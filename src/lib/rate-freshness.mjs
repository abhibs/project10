export function publishedRateStatus(updatedAt, now = Date.now()) {
 const date = new Date(updatedAt);
 if (!updatedAt || !Number.isFinite(date.getTime()) || date.getTime() > now + 60000) return {fresh:false,label:"Publication time unavailable; confirm rates with the branch."};
 const fresh = now - date.getTime() <= 24 * 60 * 60 * 1000;
 return {fresh,label:(fresh ? "Published rates" : "Rates older than 24 hours; confirm before selling") + " - updated " + date.toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"}) + " IST. Source: Aryan Gold Buyers. Checked every 60 seconds."};
}
