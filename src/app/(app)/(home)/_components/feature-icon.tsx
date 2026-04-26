type FeatureIconProps = {
  label: string;
  tone: "primary" | "secondary" | "inverse";
};

export default function FeatureIcon({ label, tone }: FeatureIconProps) {
  const toneClass = {
    primary: "bg-primary-fixed text-primary",
    secondary: "bg-secondary-fixed text-secondary",
    inverse: "bg-white/10 text-white",
  }[tone];

  return (
    <span
      className={`flex size-12 items-center justify-center rounded-xl text-lg font-bold ${toneClass}`}
    >
      {label}
    </span>
  );
}
