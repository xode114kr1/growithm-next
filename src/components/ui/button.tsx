import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  size?: "sm" | "md";
  variant: "primary" | "secondary";
};

const variantClassNames = {
  primary:
    "bg-primary text-on-primary shadow-md hover:opacity-90 active:scale-95",
  secondary:
    "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-error",
};

const sizeClassNames = {
  sm: "px-3 py-2",
  md: "px-4 py-2.5",
};

export function Button({
  className,
  size = "sm",
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "rounded-lg text-body-sm font-semibold transition-all disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none disabled:hover:opacity-100 disabled:active:scale-100",
        variantClassNames[variant],
        sizeClassNames[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      type={type}
      {...props}
    />
  );
}
