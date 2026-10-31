import { cache } from "react";
import { getBranches } from "./admin-db";
export const getPublicBranches = cache(async () => {
 try { return await getBranches(true); }
 catch (error) { console.warn("Branch database unavailable:",error.code || error.message); return []; }
});
