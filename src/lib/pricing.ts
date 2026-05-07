export const DEFAULT_RATE = 520;

export function toCRC(usdPrice: number | undefined, rate: number): string {
  if (!usdPrice || usdPrice <= 0) return "";
  const crc = Math.round(usdPrice * rate * 1.13);
  return "₡" + crc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
