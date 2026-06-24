import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ESTADO_LABEL: Record<string, { texto: string; clase: string }> = {
  publicado: { texto: "testimonio real", clase: "" },
  seleccionado_canal: { texto: "en producción", clase: "stamp-amber" },
  usado_canal: { texto: "narrado en canal", clase: "stamp-amber" },
};

export default async function Home() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, content, location, mode, status, case_number, anon_id, created_at, profiles(username)")
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"])
    .order("created_at", { ascending: false })
    .limit(12);

  const { count: totalArchivadas } = await supabase
    .from("stories")
    .select("id", { count: "exact", head: true })
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"]);

  return (
    <main>
      <section className="border-b border-border-dark py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-8 relative z-10">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-blood mb-7">
            <span className="w-2 h-2 rounded-full bg-blood inline-block" />
            ARCHIVO ABIERTO
          </div>
          <h1 className="font-display text-5xl md:text-6xl leading-tight max-w-xl">
            Lo que viste no se va a olvidar.
          </h1>
          <p className="text-bone-dim text-lg max-w-md mt-6 leading-relaxed">
            Un archivo de testimonios reales y encuentros sin explicación. Las mejores historias se narran en el canal.
          </p>
          <div className="flex gap-3 mt-9">
            <Link
              href="/enviar"
              className="font-mono text-sm tracking-wide px-6 py-3 rounded bg-blood-deep border border-blood hover:bg-blood"
            >
              Comparte tu historia
            </Link>
            <a
              href="https://youtube.com"
              target="_blank"
              className="font-mono text-sm tracking-wide px-6 py-3 rounded border border-border-dark text-bone-dim hover:border-amber hover:text-amber"
            >
              Ver el canal →
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-border-dark">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-dark">
          <div className="py-7">
            <div className="font-mono text-3xl text-amber">{totalArchivadas ?? 0}</div>
            <div className="font-mono text-xs uppercase tracking-wide text-bone-dim mt-1">historias archivadas</div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-20">
        <div className="flex justify-between items-baseline border-b border-border-dark pb-4 mb-10">
          <h2 className="font-display text-2xl">Expedientes recientes</h2>
          <span className="font-mono text-xs text-bone-dim">ORDENADO POR FECHA</span>
        </div>

        {!stories?.length && (
          <p className="text-bone-dim font-mono text-sm">
            Todavía no hay expedientes publicados. Sé el primero en abrir uno.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories?.map((story) => {
            const estado = ESTADO_LABEL[story.status] ?? ESTADO_LABEL.publicado;
            const autor =
              story.mode === "incognito"
                ? `Testigo anónimo #${String(story.anon_id).padStart(4, "0")}`
                : `@${(story.profiles as { username?: string } | null)?.username ?? "anonimo"}`;

            return (
              <Link
                key={story.id}
                href={`/historias/${story.id}`}
                className="block bg-paper border border-border-dark p-6 hover:border-amber transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs text-bone-dim">{story.case_number}</span>
                  <span className={`stamp ${estado.clase}`}>{estado.texto}</span>
                </div>
                <h3 className="font-semibold text-xl mb-2 leading-snug">{story.title}</h3>
                <p className="text-bone-dim text-sm italic leading-relaxed mb-5 line-clamp-3">
                  {story.content}
                </p>
                <div className="flex justify-between font-mono text-xs text-bone-dim border-t border-border-dark pt-3">
                  <span>{autor} · {story.location || "ubicación desconocida"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
