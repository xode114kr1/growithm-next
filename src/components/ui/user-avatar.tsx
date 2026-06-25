import Image from "next/image";

type UserAvatarProps = {
  image: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClassNames = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

const imageSizes = {
  sm: 36,
  md: 40,
  lg: 48,
};

export function UserAvatar({
  image,
  name,
  size = "md",
}: UserAvatarProps) {
  const className = `${sizeClassNames[size]} shrink-0 rounded-full border border-slate-200 bg-slate-100`;

  if (!image) {
    return (
      <span
        aria-hidden="true"
        className={`${className} flex items-center justify-center font-bold text-slate-600`}
      >
        {name[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      alt=""
      className={`${className} object-cover`}
      height={imageSizes[size]}
      src={image}
      width={imageSizes[size]}
    />
  );
}
