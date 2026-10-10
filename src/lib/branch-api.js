import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, readAdminSession } from "./admin-session";
import { findAdminById } from "./admin-db";
import { BranchError } from "./branch-values.mjs";
import { isAllowedBranchOrigin } from "./branch-origin.mjs";

export async function authorizeBranchRequest(request) {
  const session = readAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
  if (!session || !await findAdminById(session.id)) throw new BranchError("Please sign in again.", 401);
  if (request && request.method !== "GET") {
    if (!isAllowedBranchOrigin(request)) throw new BranchError("Request origin is not allowed.", 403);
  }
}

// Bound the actual streamed body as well as Content-Length before multipart parsing.
export async function readBranchForm(request) {
  const limit = 11 * 1024 * 1024;
  if (Number(request.headers.get("content-length")) > limit) throw new BranchError("Upload is too large. Images must be 10 MB or smaller.", 413);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data") || !request.body) throw new BranchError("Submit branch details as form data.");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new BranchError("Upload is too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type") } }).formData(); }
  catch { throw new BranchError("Unable to read branch form data."); }
}

export function branchApiError(error) {
  if (error instanceof BranchError) return Response.json({ message: error.message }, { status: error.status });
  if (error?.code === "ER_DUP_ENTRY") return Response.json({ message: "That Branch ID already exists. Choose a unique ID." }, { status: 409 });
  console.error("Branch operation failed:", error);
  return Response.json({ message: "Unable to complete the branch request. Please try again." }, { status: 500 });
}
