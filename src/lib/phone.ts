export function normalizeMobile(raw: string) {
  const digits = raw.replace(/[^\d+]/g, "");
  let cleaned = digits;
  if (cleaned.startsWith("00966")) {
    cleaned = "+" + cleaned.slice(2);
  } else if (/^05\d{8}$/.test(cleaned)) {
    cleaned = "+966" + cleaned.slice(1);
  } else if (/^5\d{8}$/.test(cleaned)) {
    cleaned = "+966" + cleaned;
  } else if (!cleaned.startsWith("+")) {
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
