import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteStoryButton from "../DeleteStoryButton";

export const dynamic = "force-dynamic";

async function actualizarEstado(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const category = formData.get("category") as string;
  const video_url = formData.get("video_url") as string;

  const updates: Record<string, unknown> = { status, category };
  if (status === "publicado" || status === "seleccionado_canal") {
    updates.published_at = new Date().toISOString();
  }
  if (video_url) updates.video_url = video_url;

  const { error } = await supabase.from("stories").update(updates).eq("id", id);
  if (error) throw new Error(`Error al guardar: ${error.message}`);
  revalidatePath("/admin/historias");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/archivo");
}

async function eliminarHistoria(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("stories").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/historias");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/archivo");
}

const POR_PAGINA = 20;

const ESTADO_LABEL: Record<string, string> = {
  publicado: "publicado",
  seleccionado_canal: "en producción",
  usado_canal: "narrado en canal",
  rechazado: "rechazado",
};

export default async function AdminHistoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; status?: string; category?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  const { pagina, status, category, q } = await searchParams;
  const paginaActual = Math.max(1, parseInt(pagina ?? "1"));
  const desde = (paginaActual - 1) * POR_PAGINA;

  let query = supabase
    .from("stories")
    .select("id, title, content, status, category, mode, channel_consent, video_url, case_number, created_at, profiles(username)", { count: "exact" })
    .neq("status", "pendiente")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: stories, count } = await query.range(desde, desde + POR_PAGINA - 1);

  const totalPaginas = Math.ceil((count ?? 0) / POR_PAGINA);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { status, category, q, pagina: "1", ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `/admin/historias?${params.toString()}`;
  }

  return (
    <main className="max-w-325 mx-auto px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="font-mono text-xs text-bone-dim hover:text-amber">← cola de moderación</Link>
          <h1 className="font-display text-2xl mt-3">Historias publicadas</h1>
        </div>
        <span className="font-mono text-xs text-bone-dim">{count ?? 0} historias</span>
      </div>

      {/* Filtros */}
      <form method="GET" action="/admin/historias" className="flex flex-wrap gap-3 mb-8">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por título..."
          className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono flex-1 min-w-48 focus:outline-none focus:border-amber"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono"
        >
          <option value="">Todos los estados</option>
          <option value="publicado">Publicado</option>
          <option value="seleccionado_canal">En producción</option>
          <option value="usado_canal">Narrado en canal</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono"
        >
          <option value="">Todas las categorías</option>
          <option value="testimonio_real">Testimonio real</option>
          <option value="leyenda_urbana">Leyenda urbana</option>
          <option value="paranormal">Paranormal</option>
          <option value="creepypasta">Creepypasta</option>
        </select>
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-wide border border-amber text-amber rounded px-5 py-2 hover:bg-amber hover:text-void"
        >
          Filtrar
        </button>
        {(status || category || q) && (
          <Link
            href="/admin/historias"
            className="font-mono text-xs uppercase tracking-wide border border-border-dark text-bone-dim rounded px-5 py-2 hover:border-blood hover:text-blood"
          >
            Limpiar
          </Link>
        )}
      </form>

      {/* Lista */}
      <div className="flex flex-col gap-3 mb-12">
        {!stories?.length && (
          <p className="font-mono text-xs text-bone-dim py-8 text-center border border-border-dark rounded">
            No hay historias con estos filtros.
          </p>
        )}
        {stories?.map((story) => (
          <form
            key={story.id}
            action={actualizarEstado}
            className="bg-paper border border-border-dark p-4 flex flex-col md:flex-row md:items-start gap-4"
          >
            <input type="hidden" name="id" value={story.id} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs text-bone-dim">{story.case_number}</span>
                <span className={`font-mono text-xs uppercase px-2 py-0.5 rounded border ${
                  story.status === "rechazado"
                    ? "border-blood/50 text-blood"
                    : story.status === "usado_canal"
                    ? "border-amber/50 text-amber"
                    : "border-border-dark text-bone-dim"
                }`}>
                  {ESTADO_LABEL[story.status] ?? story.status}
                </span>
                <span className="font-mono text-xs text-bone-dim">
                  {story.mode === "incognito" ? "incógnito" : `@${(story.profiles as { username?: string } | null)?.username ?? "anonimo"}`}
                </span>
              </div>
              <div className="font-semibold mb-1">{story.title}</div>
              <p className="text-bone-dim text-sm line-clamp-2">{story.content}</p>
              <Link
                href={`/historias/${story.id}`}
                target="_blank"
                className="inline-block mt-2 font-mono text-xs text-bone-dim underline hover:text-amber"
              >
                Ver completa →
              </Link>
            </div>

            <div className="flex flex-col gap-2 md:w-52 shrink-0">
              <select
                name="category"
                defaultValue={story.category ?? "testimonio_real"}
                className="bg-void border border-border-dark rounded px-3 py-2 text-xs font-mono"
              >
                <option value="testimonio_real">Testimonio real</option>
                <option value="leyenda_urbana">Leyenda urbana</option>
                <option value="paranormal">Paranormal</option>
                <option value="creepypasta">Creepypasta</option>
              </select>
              <select
                name="status"
                defaultValue={story.status}
                className="bg-void border border-border-dark rounded px-3 py-2 text-xs font-mono"
              >
                <option value="pendiente">pendiente</option>
                <option value="publicado">publicado</option>
                <option value="seleccionado_canal">seleccionado_canal</option>
                <option value="usado_canal">usado_canal</option>
                <option value="rechazado">rechazado</option>
              </select>
              <input
                name="video_url"
                placeholder="link del video"
                defaultValue={story.video_url ?? ""}
                className="bg-void border border-border-dark rounded px-3 py-2 text-xs font-mono"
              />
              <button
                type="submit"
                className="font-mono text-xs uppercase tracking-wide border border-amber text-amber rounded py-2 hover:bg-amber hover:text-void"
              >
                Guardar
              </button>
              <DeleteStoryButton action={eliminarHistoria} id={story.id} />
            </div>
          </form>
        ))}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-3">
          {paginaActual > 1 && (
            <Link
              href={buildUrl({ pagina: String(paginaActual - 1) })}
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
              href={buildUrl({ pagina: String(paginaActual + 1) })}
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
