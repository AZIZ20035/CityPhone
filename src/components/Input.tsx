import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: Props) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="mb-1 block">{label}</span>
      <input
        {...props}
        className={`w-full rounded border ${error ? "border-rose-400 bg-rose-50/30" : "border-slate-200"} px-3 py-2 text-sm focus:border-slate-400 focus:outline-none ${props.className ?? ""}`}
      />
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs text-rose-600">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </label>
  );
}
