function normalizeIndianPhone(input) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith("91")) return `+${digits}`;
  throw new Error("Enter a valid 10-digit Indian mobile number");
}
function isValidIndianPhone(input) {
  try {
    normalizeIndianPhone(input);
    return true;
  } catch {
    return false;
  }
}
function formatIndianPhoneDisplay(normalized) {
  const digits = normalized.replace(/\D/g, "");
  const local = digits.length >= 10 ? digits.slice(-10) : digits;
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : normalized;
}
export {
  formatIndianPhoneDisplay as f,
  isValidIndianPhone as i,
  normalizeIndianPhone as n
};
