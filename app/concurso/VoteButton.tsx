"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VoteButton({
  entryId,
  contestId,
  hasVoted,
  votedForThisEntry,
  isActive,
}: {
  entryId: string;
  contestId: string;
  hasVoted: boolean;
  votedForThisEntry: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isActive) return null;

  if (hasVoted) {
    return (
      <div className={`font-mono text-sm px-5 py-3 rounded border text-center ${
        votedForThisEntry
          ? "border-amber text-amber"
          : "border-border-dark text-bone-dim"
      }`}>
        {votedForThisEntry ? "✓ Tu voto" : "Ya votaste"}
      </div>
    );
  }

  async function handleVote() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/concurso/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, contestId }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "No se pudo registrar tu voto." }));
      setError(error ?? "No se pudo registrar tu voto.");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleVote}
        disabled={loading}
        className="w-full font-mono text-sm px-5 py-3 rounded border border-blood text-blood hover:bg-blood hover:text-bone transition-colors disabled:opacity-50 active:scale-95"
      >
        {loading ? "Votando..." : "Votar por este"}
      </button>
      {error && <p className="font-mono text-xs text-blood">{error}</p>}
    </div>
  );
}
