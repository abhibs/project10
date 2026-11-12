export function validateRates(input) {
  if (!input || typeof input !== "object") return null;
  const result = {};
  for (const karat of [24, 22]) {
    const value = input[karat];
    if (!["string", "number"].includes(typeof value) ||
        !/^\d+$/.test(String(value)) ||
        !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 99999999) return null;
    result[karat] = Number(value);
  }
  result[18] = Math.round(result[24] * 0.75);
  return result;
}
