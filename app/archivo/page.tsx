import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "testimonio_real", label: "Testimonio real" },
  { value: "leyenda_urbana",  label: "Leyenda urbana" },
  { value: "paranormal",      label: "Paranormal" },
  { value: "creepypasta",     label: "Creepypasta" },
];

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

const POR_PAGINA = 18;

export default async function ArchivoPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; categoria?: string }>;
}) {
  const { pagina, categoria } = await searchParams;
  const paginaActual = Math.max(1, parseInt(pagina ?? "1"));
  const desde = (paginaActual - 1) * POR_PAGINA;

  const supabase = await createClient();

  let query = supabase
    .from("stories")
    .select("id, title, content, location, mode, status, category, case_number, anon_id, created_at, profiles(username)", { count: "exact" })
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"])
    .order("created_at", { ascending: false });

  if (categoria) query = query.eq("category", categoria);

  const { data: stories, count } = await query.range(desde, desde + POR_PAGINA - 1);

  const totalPaginas = Math.ceil((count ?? 0) / POR_PAGINA);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (p > 1) params.set("pagina", String(p));
    const qs = params.toString();
    return `/archivo${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="max-w-325 mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-border-dark pb-4 mb-8">
        <div>
          <Link href="/" className="font-mono text-xs text-bone-dim hover:text-amber">← inicio</Link>
          <h1 className="font-display text-3xl mt-3">Archivo</h1>
        </div>
        <span className="font-mono text-xs text-bone-dim">{count ?? 0} historias</span>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/archivo"
          className={`font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-full border transition-colors ${
            !categoria
              ? "border-amber text-amber bg-amber/10"
              : "border-border-dark text-bone-dim hover:border-amber hover:text-amber"
          }`}
        >
          Todas
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/archivo?categoria=${cat.value}`}
            className={`font-mono text-xs uppercase tracking-wide px-4 py-2 rounded-full border transition-colors ${
              categoria === cat.value
                ? "border-amber text-amber bg-amber/10"
                : "border-border-dark text-bone-dim hover:border-amber hover:text-amber"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {!stories?.length && (
        <p className="text-bone-dim font-mono text-sm">No hay expedientes en esta categoría aún.</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories?.map((story) => {
          const stamp = STATUS_OVERRIDE[story.status] ?? CATEGORY_STAMP[story.category] ?? CATEGORY_STAMP.testimonio_real;
          const autor =
            story.mode === "incognito"
              ? `Testigo anónimo #${String(story.anon_id).padStart(4, "0")}`
              : `@${(story.profiles as { username?: string } | null)?.username ?? "anonimo"}`;

          return (
            <div key={story.id} className="bg-paper border border-border-dark hover:border-amber transition-colors flex flex-col">
              <Link href={`/historias/${story.id}`} className="block p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs text-bone-dim">{story.case_number}</span>
                  <span className={`stamp ${stamp.clase}`}>{stamp.texto}</span>
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-3 mt-14">
          {paginaActual > 1 && (
            <Link
              href={pageUrl(paginaActual - 1)}
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
              href={pageUrl(paginaActual + 1)}
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
