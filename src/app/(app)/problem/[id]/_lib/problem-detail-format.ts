export function formatAccuracy(accuracy: number | null) {
  return accuracy === null ? null : `${accuracy}%`;
}

export function formatScore(score: number | null, scoreMax: number | null) {
  if (score === null) {
    return null;
  }

  return scoreMax === null ? String(score) : `${score} / ${scoreMax}`;
}

export function getSubmittedLabel(submittedAtText: string | null) {
  return submittedAtText ?? "Submitted";
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(date);
}

export function getTierBadgeClass(tier: string) {
  if (tier.toLowerCase().includes("platinum")) {
    return "badge-tier-platinum";
  }

  if (tier.toLowerCase().includes("gold")) {
    return "badge-tier-gold";
  }

  return "badge-tier-silver";
}
