import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-text-muted select-none mr-1">
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm font-medium outline-none transition-all duration-200
          ${error
            ? "border-danger text-danger focus:ring-danger/20"
            : "border-border text-text-main focus:border-primary focus:ring-4 focus:ring-primary/10"} 
          ${props.className ?? ""}`}
      />
      {error && (
        <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-danger animate-in fade-in slide-in-from-top-1">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
