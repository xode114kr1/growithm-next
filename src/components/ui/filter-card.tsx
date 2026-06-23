import type { ReactNode } from "react";

export default function FilterCard({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
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
