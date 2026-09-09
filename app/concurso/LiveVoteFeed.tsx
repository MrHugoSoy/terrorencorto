"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FeedEntry = {
  id: string;
  entry_id: string;
  username: string;
  message: string | null;
  created_at: string;
};

export default function LiveVoteFeed({
  contestId,
  initialFeed,
  entryTitleById,
}: {
  contestId: string;
  initialFeed: FeedEntry[];
  entryTitleById: Record<string, string>;
}) {
  const [feed, setFeed] = useState(initialFeed);

  useEffect(() => {
    setFeed(initialFeed);

    const supabase = createClient();
    const channel = supabase
      .channel(`contest-vote-feed-${contestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contest_vote_feed", filter: `contest_id=eq.${contestId}` },
        (payload) => {
          const row = payload.new as FeedEntry;
          setFeed((prev) => [row, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contestId, initialFeed]);

  return (
    <div className="lg:w-80 shrink-0 border border-border-dark rounded flex flex-col max-h-100">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dark shrink-0">
        <span className="w-2 h-2 rounded-full bg-blood inline-block animate-pulse" />
        <span className="font-mono text-xs uppercase tracking-wide text-bone-dim">Actividad en vivo</span>
      </div>
      <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
        {feed.length === 0 && (
          <p className="font-mono text-xs text-bone-dim">Sé el primero en votar.</p>
        )}
        {feed.map((f) => (
          <p key={f.id} className="font-mono text-xs text-bone-dim leading-relaxed">
            <span className="text-amber">@{f.username}</span> votó por{" "}
            <span className="text-bone">{entryTitleById[f.entry_id] ?? "un corto"}</span>
            {f.message && <span className="block mt-0.5 text-bone-dim/80">&quot;{f.message}&quot;</span>}
          </p>
        ))}
      </div>
    </div>
  );
}
