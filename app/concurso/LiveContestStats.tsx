"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LiveContestStats({
  contestId,
  entryCount,
  initialVotes,
}: {
  contestId: string;
  entryCount: number;
  initialVotes: number;
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [prevInitialVotes, setPrevInitialVotes] = useState(initialVotes);

  if (initialVotes !== prevInitialVotes) {
    setPrevInitialVotes(initialVotes);
    setVotes(initialVotes);
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`contest-votes-${contestId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contests", filter: `id=eq.${contestId}` },
        (payload) => setVotes((payload.new as { vote_count: number }).vote_count)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contestId]);

  return (
    <>
      <span>{entryCount} cortos participando</span>
      <span>{votes} votos</span>
    </>
  );
}
