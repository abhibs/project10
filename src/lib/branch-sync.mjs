const EXPECTED_STATUSES = new Set([200, 201]);

export class BranchSyncError extends Error {
  constructor(cause) {
    super("Branch was not saved because the branch API push failed. Please try again.", { cause });
    this.status = 502;
  }
}

export function buildBranchUpsertPayload(branch) {
  return {
    branchId: branch.branchId,
    name: branch.name,
    area: branch.area,
    city: branch.city,
    state: branch.state,
    pincode: branch.pincode,
    timings: branch.timings,
    address: branch.address,
    status: branch.status,
    latitude: branch.latitude,
    longitude: branch.longitude,
    url: branch.url || "",
  };
}

export function buildBranchUpsertRequest(
  branch,
  endpoint = process.env.BRANCH_ADMIN_API_URL,
  token = process.env.BRANCH_ADMIN_API_TOKEN,
) {
  if (!endpoint) throw new Error("BRANCH_ADMIN_API_URL is not configured.");
  if (!token) throw new Error("BRANCH_ADMIN_API_TOKEN is not configured.");

  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("BRANCH_ADMIN_API_URL must be a valid URL.");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("BRANCH_ADMIN_API_URL must be an HTTP(S) URL without embedded credentials.");
  }

  return {
    url: url.toString(),
    options: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildBranchUpsertPayload(branch)),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  };
}

export async function sendBranchUpsert(branch) {
  const { url, options } = buildBranchUpsertRequest(branch);
  const response = await fetch(url, options);
  if (!EXPECTED_STATUSES.has(response.status)) {
    throw new Error(`Branch upsert API returned HTTP ${response.status}; expected HTTP 200 or 201.`);
  }
  return response;
}

export async function requireBranchUpsert(branch, send = sendBranchUpsert) {
  try {
    return await send(branch);
  } catch (error) {
    throw new BranchSyncError(error);
  }
}

export async function requireBranchDeactivation(branch, send = sendBranchUpsert) {
  return requireBranchUpsert({ ...branch, status: "inactive" }, send);
}
