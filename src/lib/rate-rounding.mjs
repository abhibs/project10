export function floorRateToHundreds(value) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return NaN;
  return Math.floor(rate / 100) * 100;
}
