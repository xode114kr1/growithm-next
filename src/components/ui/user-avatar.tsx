import Image from "next/image";

type UserAvatarProps = {
  className?: string;
  fallback?: string;
  image?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClassNames = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-14 text-lg",
};

const imageSizes = {
  sm: 36,
  md: 40,
  lg: 48,
  xl: 56,
};

export function UserAvatar({
  className,
  fallback,
  image,
  name,
  size = "md",
}: UserAvatarProps) {
  const avatarClassName = [
    sizeClassNames[size],
    "shrink-0 rounded-full border border-slate-200 bg-slate-100",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!image) {
    return (
      <span
        aria-hidden="true"
        className={`${avatarClassName} flex items-center justify-center font-bold text-slate-600`}
      >
        {fallback ?? name[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      alt=""
      className={`${avatarClassName} object-cover`}
      height={imageSizes[size]}
      src={image}
      width={imageSizes[size]}
    />
  );
}
