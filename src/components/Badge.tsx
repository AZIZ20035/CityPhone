const statusClasses: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  DIAGNOSED: "bg-amber-100 text-amber-700",
  WAITING_PART: "bg-orange-100 text-orange-700",
  IN_REPAIR: "bg-indigo-100 text-indigo-700",
  READY: "bg-green-100 text-green-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-rose-100 text-rose-700"
};

export default function Badge({ value }: { value: string }) {
  const cls = statusClasses[value] ?? "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs ${cls}`}>
      {value}
    </span>
  );
}
