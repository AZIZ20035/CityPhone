import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export default function Select({ label, children, ...props }: Props) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-1 block">{label}</span>
      <select
        {...props}
        className={`w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none ${props.className ?? ""}`}
      >
        {children}
      </select>
    </label>
  );
}
