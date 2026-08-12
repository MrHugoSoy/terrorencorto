import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RecTimer from "@/components/RecTimer";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

const CATEGORY_STAMP: Record<string, { texto: string; clase: string }> = {
  testimonio_real: { texto: "Testimonio real", clase: "stamp-amber" },
  leyenda_urbana:  { texto: "Leyenda urbana",  clase: "stamp-dim" },
  paranormal:      { texto: "Paranormal",      clase: "" },
  creepypasta:     { texto: "Creepypasta",     clase: "stamp-dim" },
};

const STATUS_OVERRIDE: Record<string, { texto: string; clase: string }> = {
  seleccionado_canal: { texto: "en producción",   clase: "stamp-amber" },
  usado_canal:        { texto: "narrado en canal", clase: "stamp-amber" },
};

export default async function Home() {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, content, location, mode, status, category, case_number, anon_id, created_at, profiles(username)")
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"])
    .order("created_at", { ascending: false })
    .limit(9);

  const { count: totalArchivadas } = await supabase
    .from("stories")
    .select("id", { count: "exact", head: true })
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"]);

  const semanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: enviadasSemana } = await supabase
    .from("stories")
    .select("id", { count: "exact", head: true })
    .gte("created_at", semanaAtras);

  return (
    <main>
      <section className="hero-scan border-b border-border-dark py-24 relative overflow-hidden">
        <div className="max-w-325 mx-auto px-8 relative z-10">
          <RecTimer />
          <h1 className="title-glitch font-display text-6xl md:text-7xl leading-tight max-w-3xl">
            Lo que viste<br />no se va a olvidar.
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
              href="https://www.youtube.com/@terrorencorto"
              target="_blank"
              className="font-mono text-sm tracking-wide px-6 py-3 rounded border border-border-dark text-bone-dim hover:border-amber hover:text-amber"
            >
              Ver el canal →
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-border-dark">
        <div className="max-w-325 mx-auto px-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-dark">
          <div className="py-7">
            <div className="font-mono text-3xl text-amber">{totalArchivadas ?? 0}</div>
            <div className="font-mono text-xs uppercase tracking-wide text-bone-dim mt-1">historias archivadas</div>
          </div>
          <div className="py-7 md:px-8">
            <div className="font-mono text-3xl text-amber">{enviadasSemana ?? 0}</div>
            <div className="font-mono text-xs uppercase tracking-wide text-bone-dim mt-1">enviadas esta semana</div>
          </div>
          <div className="py-7 md:px-8">
            <div className="font-mono text-3xl text-amber">9,4k</div>
            <div className="font-mono text-xs uppercase tracking-wide text-bone-dim mt-1">testigos leyendo</div>
          </div>
        </div>
      </section>

      <section className="max-w-325 mx-auto px-8 py-20">
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
            const estado = STATUS_OVERRIDE[story.status] ?? CATEGORY_STAMP[story.category] ?? CATEGORY_STAMP.testimonio_real;
            const autor =
              story.mode === "incognito"
                ? `Testigo anónimo #${String(story.anon_id).padStart(4, "0")}`
                : `@${(story.profiles as { username?: string } | null)?.username ?? "anonimo"}`;

            return (
              <div key={story.id} className="bg-paper border border-border-dark hover:border-amber transition-colors flex flex-col">
                <Link href={`/historias/${story.id}`} className="block p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-xs text-bone-dim">{story.case_number}</span>
                    <span className={`stamp ${estado.clase}`}>{estado.texto}</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-2 leading-snug">{story.title}</h3>
                  <p className="text-bone-dim text-sm italic leading-relaxed line-clamp-3">
                    {story.content}
                  </p>
                </Link>
                <div className="px-6 pb-4 border-t border-border-dark pt-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-bone-dim truncate mr-3">
                    {autor} · {story.location || "ubicación desconocida"}
                  </span>
                  <ShareButtons id={story.id} title={story.title} />
                </div>
              </div>
            );
          })}
        </div>

        {(totalArchivadas ?? 0) > 9 && (
          <div className="mt-12 text-center">
            <Link
              href="/archivo"
              className="font-mono text-xs uppercase tracking-widest border border-border-dark text-bone-dim px-8 py-3 rounded hover:border-amber hover:text-amber"
            >
              Ver todas las historias →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
