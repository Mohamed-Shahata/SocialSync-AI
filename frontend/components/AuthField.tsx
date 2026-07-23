import { InputHTMLAttributes, ReactNode } from "react";

export default function AuthField({
  label,
  icon,
  error,
  trailingLink,
  ...props
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  trailingLink?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral">
          {label}
        </label>
        {trailingLink}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
          {icon}
        </span>
        <input
          {...props}
          className="w-full rounded-xl border border-surface-line bg-bg-soft py-2.5 pr-10 pl-3 text-sm text-neutral outline-none transition-colors placeholder:text-muted/70 focus:border-primary-light focus:bg-white"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
