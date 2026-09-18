export function validateRates(input) {
  if (!input || typeof input !== "object") return null;
  const result = {};
  for (const karat of [24, 22, 18]) {
    const value = input[karat];
    if (!["string", "number"].includes(typeof value) ||
        !/^\d+(\.\d{1,2})?$/.test(String(value)) ||
        !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 99999999.99) return null;
    result[karat] = Number(value);
  }
  return result;
}
