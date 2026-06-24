import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import VoteButton from "./VoteButton";

export const dynamic = "force-dynamic";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export default async function ConcursoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: contest } = await supabase
    .from("contests")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  const now = new Date();
  const isOpen = contest && (!contest.ends_at || new Date(contest.ends_at) > now);

  const { data: entries } = contest
    ? await supabase
        .from("contest_entries")
        .select("id, title, youtube_url, description, contest_votes(id)")
        .eq("contest_id", contest.id)
        .order("created_at")
    : { data: [] };

  const { data: myVote } = user && contest
    ? await supabase
        .from("contest_votes")
        .select("entry_id")
        .eq("contest_id", contest.id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const sorted = [...(entries ?? [])].sort(
    (a, b) => (b.contest_votes?.length ?? 0) - (a.contest_votes?.length ?? 0)
  );

  if (!contest) {
    return (
      <main className="max-w-3xl mx-auto px-8 py-24 text-center">
        <p className="font-mono text-xs text-blood uppercase tracking-widest mb-4">Concurso anual</p>
        <h1 className="font-display text-4xl mb-6">No hay concurso activo por ahora</h1>
        <p className="text-bone-dim">Vuelve pronto — cada año los mejores cortos compiten aquí.</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      <div className="border-b border-border-dark pb-8 mb-12">
        <p className="font-mono text-xs text-blood uppercase tracking-widest mb-3">Concurso {contest.year}</p>
        <h1 className="font-display text-4xl mb-4">{contest.title}</h1>
        <div className="flex items-center gap-6 font-mono text-xs text-bone-dim">
          {isOpen ? (
            <>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blood inline-block animate-pulse" />
                Votación abierta
              </span>
              {contest.ends_at && (
                <span>Cierra el {new Date(contest.ends_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</span>
              )}
            </>
          ) : (
            <span className="text-bone-dim">Votación cerrada</span>
          )}
          <span>{sorted.length} cortos participando</span>
        </div>

        {!user && isOpen && (
          <div className="mt-6 border border-border-dark rounded px-4 py-3 font-mono text-xs text-bone-dim">
            <Link href="/registro" className="text-amber hover:underline">Crea una cuenta</Link> o{" "}
            <Link href="/login" className="text-amber hover:underline">inicia sesión</Link> para votar.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sorted.map((entry, i) => {
          const videoId = getYouTubeId(entry.youtube_url);
          const votes = entry.contest_votes?.length ?? 0;
          const isMyVote = myVote?.entry_id === entry.id;

          return (
            <div key={entry.id} className="bg-paper border border-border-dark">
              {videoId && (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    {i === 0 && <span className="font-mono text-xs text-amber mr-2">#1</span>}
                    <span className="font-semibold text-lg">{entry.title}</span>
                  </div>
                  <span className="font-mono text-xs text-bone-dim shrink-0">{votes} {votes === 1 ? "voto" : "votos"}</span>
                </div>
                {entry.description && (
                  <p className="text-bone-dim text-sm leading-relaxed mb-4">{entry.description}</p>
                )}
                {user ? (
                  <VoteButton
                    entryId={entry.id}
                    contestId={contest.id}
                    hasVoted={!!myVote}
                    votedForThisEntry={isMyVote}
                    isActive={!!isOpen}
                  />
                ) : isOpen ? (
                  <Link href="/login" className="font-mono text-xs px-4 py-2 rounded border border-border-dark text-bone-dim hover:border-amber hover:text-amber">
                    Inicia sesión para votar
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
