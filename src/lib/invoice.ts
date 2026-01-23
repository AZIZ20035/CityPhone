export function getRiyadhDateKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}${month}${day}`;
}

export function formatInvoiceNo(dateKey: string, counter: number) {
  return `SRV-${dateKey}-${String(counter).padStart(4, "0")}`;
}

export function formatSimpleInvoice(counter: number) {
  if (counter >= 10000) {
    return String(counter);
  }
  return String(counter).padStart(6, "0");
}
