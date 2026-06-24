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

  if (!isActive) return null;

  if (hasVoted) {
    return (
      <div className={`font-mono text-xs px-4 py-2 rounded border ${
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
    await fetch("/api/concurso/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, contestId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className="font-mono text-xs px-4 py-2 rounded border border-blood text-blood hover:bg-blood hover:text-bone transition-colors disabled:opacity-50"
    >
      {loading ? "Votando..." : "Votar por este"}
    </button>
  );
}
