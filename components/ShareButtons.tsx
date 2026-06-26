"use client";

import { useState } from "react";

const DOMAIN = "https://terrorencorto.com";

export default function ShareButtons({
  id,
  title,
  size = "sm",
}: {
  id: string;
  title: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  const url = `${DOMAIN}/historias/${id}`;
  const text = `"${title}" en Terror en Corto`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: text, url });
        return;
      } catch {
        // cancelled — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const base =
    size === "md"
      ? "font-mono text-xs uppercase tracking-wide px-4 py-2 rounded border transition-colors"
      : "font-mono text-xs px-3 py-1.5 rounded border transition-colors";

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en WhatsApp"
        className={`${base} border-border-dark text-bone-dim hover:border-green-600 hover:text-green-500`}
      >
        {size === "md" ? "WhatsApp" : "WA"}
      </a>
      <button
        onClick={handleShare}
        aria-label="Compartir enlace"
        className={`${base} border-border-dark text-bone-dim hover:border-amber hover:text-amber`}
      >
        {copied ? "¡Copiado!" : size === "md" ? "Copiar enlace" : "↗"}
      </button>
    </div>
  );
}
