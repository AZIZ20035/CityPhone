import { Invoice, Settings } from "@prisma/client";
import dayjs from "dayjs";

export function renderTemplate(
  body: string,
  data: {
    invoice: Invoice;
    settings: Settings;
  }
) {
  const { invoice, settings } = data;
  const replacements: Record<string, string> = {
    "{customer_name}": invoice.customerName ?? "",
    "{mobile}": invoice.mobile ?? "",
    "{invoice_no}": invoice.invoiceNo,
    "{device_name}": invoice.deviceType ?? "",
    "{model}": "",
    "{color}": "",
    "{problem}": invoice.problem ?? "",
    "{repair_status}": invoice.deviceStatus,
    "{part_status}": "",
    "{expected_part_arrival_date}": "",
    "{shop_name}": settings.shopName,
    "{shop_phone}": settings.shopPhone,
    "{final_cost}": invoice.agreedPrice ? invoice.agreedPrice.toString() : "",
    "{created_at}": dayjs(invoice.createdAt).format("YYYY-MM-DD HH:mm")
  };

  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replaceAll(key, value),
    body
  );
}
