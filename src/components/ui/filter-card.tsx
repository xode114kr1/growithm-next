import type { ComponentProps, ReactNode } from "react";

type FilterCardProps = {
  children: ReactNode;
  className?: string;
  title: string;
};

export function FilterCard({
  children,
  className,
  title,
}: FilterCardProps) {
  return (
    <div
      className={["app-card min-w-0 p-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <h2 className="mb-3 block text-label-caps text-slate-500">{title}</h2>
      {children}
    </div>
  );
}

type FilterOptionButtonProps = ComponentProps<"button"> & {
  isActive: boolean;
};

export function FilterOptionButton({
  children,
  className,
  isActive,
  type = "button",
  ...props
}: FilterOptionButtonProps) {
  return (
    <button
      aria-pressed={isActive}
      className={[
        "rounded-lg border px-3 py-1.5 text-body-sm font-medium transition-colors",
        isActive
          ? "border-primary-container/20 bg-primary-container text-on-primary-container"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-container hover:text-primary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function FilterSelect({
  className,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={[
        "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
