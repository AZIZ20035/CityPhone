const statusClasses: Record<string, string> = {
  NEW: "bg-info-bg text-info-text border-info-border",
  WAITING_PARTS: "bg-warning-bg text-warning-text border-warning-border",
  READY: "bg-success-bg text-success-text border-success-border",
  DELIVERED: "bg-surface-elevated text-text-muted border-border",
  REFUSED: "bg-danger-bg text-danger-text border-danger-border",
};

const statusLabels: Record<string, string> = {
  NEW: "جديد",
  WAITING_PARTS: "انتظار قطع",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  REFUSED: "تم الرفض",
};

export default function Badge({ status }: { status: string }) {
  const cls = statusClasses[status] ?? "bg-slate-50 text-slate-700 border-slate-200";
  const label = statusLabels[status] ?? status;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
