import type { ReactNode } from "react";

type ActionStateMessageProps = {
  children: ReactNode;
  className?: string;
  variant: "error" | "success";
};

const variantClassNames = {
  error: "bg-error/10 text-error",
  success: "bg-secondary-container/60 text-primary",
};

export function ActionStateMessage({
  children,
  className,
  variant,
}: ActionStateMessageProps) {
  return (
    <p
      className={[
        "rounded-lg px-4 py-3 text-body-sm font-medium",
        variantClassNames[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      {children}
    </p>
  );
}
