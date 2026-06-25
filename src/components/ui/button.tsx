import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  size?: ButtonSize;
  variant: ButtonVariant;
};

const variantClassNames = {
  primary:
    "bg-primary text-on-primary shadow-md hover:opacity-90 active:scale-95",
  secondary:
    "border border-outline-variant bg-surface-container-lowest text-primary hover:border-secondary hover:text-secondary hover:ring-3 hover:ring-secondary-container/30",
};

const sizeClassNames = {
  lg: "min-h-14 rounded-xl px-8 text-base",
  md: "min-h-11 px-4 text-body-sm",
  sm: "px-3 py-2 text-body-sm",
  xs: "rounded-md px-3 py-1.5 text-xs",
};

type ButtonSize = keyof typeof sizeClassNames;
type ButtonVariant = keyof typeof variantClassNames;

function getButtonClassName({
  className,
  size,
  variant,
}: {
  className?: string;
  size: ButtonSize;
  variant: ButtonVariant;
}) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-500 disabled:shadow-none disabled:ring-0 disabled:hover:opacity-100 disabled:active:scale-100",
    variantClassNames[variant],
    sizeClassNames[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  className,
  size = "md",
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName({ className, size, variant })}
      type={type}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  size?: ButtonSize;
  variant: ButtonVariant;
};

export function ButtonLink({
  className,
  size = "md",
  variant,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName({ className, size, variant })}
      {...props}
    />
  );
}

type ButtonAnchorProps = ComponentProps<"a"> & {
  size?: ButtonSize;
  variant: ButtonVariant;
};

export function ButtonAnchor({
  className,
  size = "md",
  variant,
  ...props
}: ButtonAnchorProps) {
  return (
    <a
      className={getButtonClassName({ className, size, variant })}
      {...props}
    />
  );
}
