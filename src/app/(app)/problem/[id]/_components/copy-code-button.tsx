"use client";

import { useState } from "react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-semibold text-on-tertiary-container transition-colors hover:border-white/30 hover:text-white"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
