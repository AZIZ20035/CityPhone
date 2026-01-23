import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function Input({ label, ...props }: Props) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-1 block">{label}</span>
      <input
        {...props}
        className={`w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none ${props.className ?? ""}`}
      />
    </label>
  );
}
