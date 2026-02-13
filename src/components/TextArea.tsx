import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export default function TextArea({ label, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-black text-text-muted select-none mr-1">
        {label}
      </label>
      <textarea
        {...props}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-main outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[120px] ${props.className ?? ""}`}
      />
    </div>
  );
}
