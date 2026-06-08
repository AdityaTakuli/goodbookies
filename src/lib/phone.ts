/** Normalize Indian mobile numbers to E.164 (+91XXXXXXXXXX). */
export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("91")) return `+${digits}`;
  throw new Error("Enter a valid 10-digit Indian mobile number");
}

export function isValidIndianPhone(input: string): boolean {
  try {
    normalizeIndianPhone(input);
    return true;
  } catch {
    return false;
  }
}

export function formatIndianPhoneDisplay(normalized: string): string {
  const digits = normalized.replace(/\D/g, "");
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : normalized;
}
