import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

export default async function HistoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story } = await supabase
    .from("stories")
    .select("id, title, content, location, mode, status, case_number, anon_id, created_at, video_url, profiles(username)")
    .eq("id", id)
    .single();

  if (!story) notFound();

  const autor =
    story.mode === "incognito"
      ? `Testigo anónimo #${String(story.anon_id).padStart(4, "0")}`
      : `@${(story.profiles as { username?: string } | null)?.username ?? "anonimo"}`;

  return (
    <main className="max-w-2xl mx-auto px-8 py-16">
      <Link href="/" className="font-mono text-xs text-bone-dim hover:text-amber">
        ← volver al archivo
      </Link>

      <div className="flex justify-between items-center mt-8 mb-4 font-mono text-xs text-bone-dim">
        <span>{story.case_number}</span>
        <span>{autor} · {story.location || "ubicación desconocida"}</span>
      </div>

      <h1 className="font-display text-3xl leading-tight mb-8">{story.title}</h1>

      <article className="text-bone leading-loose text-lg whitespace-pre-wrap">
        {story.content}
      </article>

      <div className="mt-10 pt-8 border-t border-border-dark flex flex-wrap items-center gap-4">
        <span className="font-mono text-xs text-bone-dim uppercase tracking-wide">Compartir</span>
        <ShareButtons id={story.id} title={story.title} size="md" />
      </div>

      {story.video_url && (
        <a
          href={story.video_url}
          target="_blank"
          className="inline-block mt-6 font-mono text-sm border border-amber text-amber px-5 py-3 rounded hover:bg-amber hover:text-void"
        >
          Ver la versión narrada en el canal →
        </a>
      )}
    </main>
  );
}
