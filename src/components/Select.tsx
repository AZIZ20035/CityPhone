import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export default function Select({ label, children, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-text-muted select-none mr-1">
        {label}
      </label>
      <select
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 ${props.className ?? ""}`}
      >
        {children}
      </select>
    </div>
  );
}
