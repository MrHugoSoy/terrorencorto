import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CATEGORY_STAMP: Record<string, { texto: string; clase: string }> = {
  sin_resolver:    { texto: "sin resolver",    clase: "" },
  testimonio_real: { texto: "testimonio real", clase: "stamp-amber" },
  archivado:       { texto: "archivado",       clase: "stamp-dim" },
};

const STATUS_OVERRIDE: Record<string, { texto: string; clase: string }> = {
  seleccionado_canal: { texto: "en producción",   clase: "stamp-amber" },
  usado_canal:        { texto: "narrado en canal", clase: "stamp-amber" },
};

const POR_PAGINA = 18;

export default async function HistoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { pagina } = await searchParams;
  const paginaActual = Math.max(1, parseInt(pagina ?? "1"));
  const desde = (paginaActual - 1) * POR_PAGINA;

  const supabase = await createClient();

  const { data: stories, count } = await supabase
    .from("stories")
    .select("id, title, content, location, mode, status, category, case_number, anon_id, created_at, profiles(username)", { count: "exact" })
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"])
    .order("created_at", { ascending: false })
    .range(desde, desde + POR_PAGINA - 1);

  const totalPaginas = Math.ceil((count ?? 0) / POR_PAGINA);

  return (
    <main className="max-w-325 mx-auto px-8 py-16">
      <div className="flex items-baseline justify-between border-b border-border-dark pb-4 mb-10">
        <div>
          <Link href="/" className="font-mono text-xs text-bone-dim hover:text-amber">← inicio</Link>
          <h1 className="font-display text-3xl mt-3">Archivo de expedientes</h1>
        </div>
        <span className="font-mono text-xs text-bone-dim">{count ?? 0} historias</span>
      </div>

      {!stories?.length && (
        <p className="text-bone-dim font-mono text-sm">No hay expedientes publicados aún.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories?.map((story) => {
          const stamp = STATUS_OVERRIDE[story.status] ?? CATEGORY_STAMP[story.category] ?? CATEGORY_STAMP.sin_resolver;
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
                <span className={`stamp ${stamp.clase}`}>{stamp.texto}</span>
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

      {totalPaginas > 1 && (
        <div className="flex justify-center gap-3 mt-14">
          {paginaActual > 1 && (
            <Link
              href={`/historias?pagina=${paginaActual - 1}`}
              className="font-mono text-xs uppercase tracking-widest border border-border-dark text-bone-dim px-6 py-3 rounded hover:border-amber hover:text-amber"
            >
              ← Anterior
            </Link>
          )}
          <span className="font-mono text-xs text-bone-dim flex items-center px-4">
            {paginaActual} / {totalPaginas}
          </span>
          {paginaActual < totalPaginas && (
            <Link
              href={`/historias?pagina=${paginaActual + 1}`}
              className="font-mono text-xs uppercase tracking-widest border border-border-dark text-bone-dim px-6 py-3 rounded hover:border-amber hover:text-amber"
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
