export const Roles = {
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  VIEWER: "VIEWER"
} as const;

export const RepairStatuses = {
  NEW: "NEW",
  RECEIVED: "RECEIVED",
  DIAGNOSED: "DIAGNOSED",
  WAITING_PART: "WAITING_PART",
  IN_REPAIR: "IN_REPAIR",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED"
} as const;

export const PartStatuses = {
  NOT_NEEDED: "NOT_NEEDED",
  ORDERED: "ORDERED",
  ARRIVED: "ARRIVED",
  DELAYED: "DELAYED"
} as const;

export const MessageChannels = {
  WHATSAPP: "WHATSAPP",
  SMS: "SMS"
} as const;

export const MessageStatuses = {
  QUEUED: "QUEUED",
  SENT: "SENT",
  FAILED: "FAILED"
} as const;

export const PaymentStatuses = {
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID"
} as const;

export const PaymentMethods = {
  CASH: "CASH",
  CARD: "CARD",
  TRANSFER: "TRANSFER",
  OTHER: "OTHER"
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
