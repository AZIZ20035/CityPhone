export function normalizeMobile(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  let cleaned = digits;
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }
  if (cleaned.startsWith("0") && !cleaned.startsWith("+")) {
    cleaned = "+966" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("966")) {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

export function isValidKsaMobile(raw: string) {
  const mobile = normalizeMobile(raw);
  return /^\+9665\d{8}$/.test(mobile);
}
