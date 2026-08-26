import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VoteButton from "./VoteButton";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export default async function ConcursoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: allContests } = await supabase
    .from("contests")
    .select("*, contest_entries!contest_id(id, title, youtube_url, description)")
    .order("year", { ascending: false });

  const now = new Date();
  const activeContest = allContests?.find(c => c.is_active) ?? null;
  const pastContests = allContests?.filter(c => !c.is_active && c.is_published) ?? [];

  const isOpen = activeContest && (!activeContest.ends_at || new Date(activeContest.ends_at) > now);

  const { data: myVote } = user && activeContest
    ? await supabase
        .from("contest_votes")
        .select("entry_id")
        .eq("contest_id", activeContest.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const sortedEntries = (entries: { id: string; title: string; youtube_url: string; description?: string }[] | null) =>
    [...(entries ?? [])];

  return (
    <main className="max-w-325 mx-auto px-8 py-16">

      {/* Concurso activo */}
      {activeContest ? (
        <section className="mb-24">
          <div className="border-b border-border-dark pb-8 mb-12">
            <p className="font-mono text-xs text-blood uppercase tracking-widest mb-3">Concurso {activeContest.year}</p>
            <h1 className="font-display text-4xl mb-4">{activeContest.title}</h1>
            <div className="flex items-center gap-6 font-mono text-xs text-bone-dim">
              {isOpen ? (
                <>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blood inline-block animate-pulse" />
                    Votación abierta
                  </span>
                  {activeContest.ends_at && (
                    <span>Cierra el {new Date(activeContest.ends_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </>
              ) : (
                <span>Votación cerrada</span>
              )}
              <span>{activeContest.contest_entries?.length ?? 0} cortos participando</span>
            </div>
            {!user && isOpen && (
              <div className="mt-6 border border-border-dark rounded px-4 py-3 font-mono text-xs text-bone-dim">
                <Link href="/registro" className="text-amber hover:underline">Crea una cuenta</Link> o{" "}
                <Link href="/login" className="text-amber hover:underline">inicia sesión</Link> para votar.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sortedEntries(activeContest.contest_entries).map((entry) => (
              <VideoCard
                key={entry.id}
                youtubeUrl={entry.youtube_url}
                title={entry.title}
                description={entry.description}
                shareUrl={entry.youtube_url}
              >
                {user ? (
                  <VoteButton
                    entryId={entry.id}
                    contestId={activeContest.id}
                    hasVoted={!!myVote}
                    votedForThisEntry={myVote?.entry_id === entry.id}
                    isActive={!!isOpen}
                  />
                ) : isOpen ? (
                  <Link href="/login" className="font-mono text-xs px-4 py-2 rounded border border-border-dark text-bone-dim hover:border-amber hover:text-amber">
                    Inicia sesión para votar
                  </Link>
                ) : null}
              </VideoCard>
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-16 mb-24 border-b border-border-dark">
          <p className="font-mono text-xs text-blood uppercase tracking-widest mb-4">Concurso anual</p>
          <h1 className="font-display text-4xl mb-6">No hay concurso activo por ahora</h1>
          <p className="text-bone-dim">Vuelve pronto — cada año los mejores cortos compiten aquí.</p>
        </section>
      )}

      {/* Concursos anteriores */}
      {pastContests.length > 0 && (
        <section>
          <div className="border-b border-border-dark pb-4 mb-12">
            <h2 className="font-display text-2xl">Concursos anteriores</h2>
          </div>

          <div className="flex flex-col gap-20">
            {pastContests.map((contest) => {
              return (
                <div key={contest.id}>
                  <div className="flex items-baseline gap-4 mb-8">
                    <h3 className="font-display text-xl">{contest.title}</h3>
                    <span className="font-mono text-xs text-bone-dim">{contest.year}</span>
                    {contest.winner_entry_id && (
                      <span className="font-mono text-xs text-amber">
                        Ganador: {contest.contest_entries?.find((e: { id: string }) => e.id === contest.winner_entry_id)?.title}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...(contest.contest_entries ?? [])].sort((a: { id: string }, b: { id: string }) =>
                      a.id === contest.winner_entry_id ? -1 : b.id === contest.winner_entry_id ? 1 : 0
                    ).map((entry: { id: string; title: string; youtube_url: string }) => {
                      const isWinner = entry.id === contest.winner_entry_id;
                      return (
                        <VideoCard
                          key={entry.id}
                          youtubeUrl={entry.youtube_url}
                          title={entry.title}
                          shareUrl={entry.youtube_url}
                          winner={isWinner}
                          badge={isWinner ? { texto: "🏆 Ganador", clase: "stamp-amber" } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
