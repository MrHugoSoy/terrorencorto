import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import DeleteContestButton from "./DeleteContestButton";

export const dynamic = "force-dynamic";

async function crearConcurso(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("contests").insert({
    year: parseInt(formData.get("year") as string),
    title: formData.get("title") as string,
    ends_at: formData.get("ends_at") || null,
    is_active: false,
    is_published: false,
  });
  revalidatePath("/admin/concurso");
}

async function crearArchivoHistorico(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("contests").insert({
    year: parseInt(formData.get("year") as string),
    title: formData.get("title") as string,
    is_active: false,
    is_published: true,
  });
  revalidatePath("/admin/concurso");
  revalidatePath("/concurso");
}

async function toggleConcurso(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  await supabase.from("contests").update({ is_active }).eq("id", id);
  revalidatePath("/admin/concurso");
}

async function togglePublicado(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const is_published = formData.get("is_published") === "true";
  await supabase.from("contests").update({ is_published }).eq("id", id);
  revalidatePath("/admin/concurso");
  revalidatePath("/concurso");
}

async function agregarEntrada(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("contest_entries").insert({
    contest_id: formData.get("contest_id") as string,
    title: formData.get("title") as string,
    youtube_url: formData.get("youtube_url") as string,
    description: formData.get("description") as string || null,
  });
  revalidatePath("/admin/concurso");
}

async function eliminarEntrada(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("contest_entries").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/concurso");
}

async function marcarGanador(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const winner_entry_id = formData.get("winner_entry_id") as string || null;
  await supabase.from("contests").update({ winner_entry_id }).eq("id", id);
  revalidatePath("/admin/concurso");
  revalidatePath("/concurso");
}

async function eliminarConcurso(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("contests").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/concurso");
  revalidatePath("/concurso");
}

export default async function AdminConcursoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  const { data: contests } = await supabase
    .from("contests")
    .select("*, contest_entries!contest_id(id, title, youtube_url, description)")
    .order("year", { ascending: false });

  const now = new Date();

  return (
    <main className="max-w-325 mx-auto px-8 py-16">
      <h1 className="font-display text-2xl mb-2">Gestión de concursos</h1>
      <p className="text-bone-dim text-sm mb-10">Crea concursos anuales, agrega cortos y abre la votación.</p>

      {/* Crear concurso con votación */}
      <div className="bg-paper border border-border-dark p-6 mb-6">
        <h2 className="font-display text-lg mb-1">Nuevo concurso con votación</h2>
        <p className="font-mono text-xs text-bone-dim mb-5">Los usuarios podrán votar cuando lo actives.</p>
        <form action={crearConcurso} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">Año</label>
            <input name="year" type="number" defaultValue={new Date().getFullYear()} required
              className="w-full bg-void border border-border-dark rounded px-3 py-2 text-bone font-mono text-sm" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">Título</label>
            <input name="title" type="text" required placeholder="Ej: El Corto del Año 2025"
              className="w-full bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">Fecha de cierre</label>
            <input name="ends_at" type="datetime-local"
              className="w-full bg-void border border-border-dark rounded px-3 py-2 text-bone font-mono text-sm" />
          </div>
          <div className="md:col-span-3">
            <button type="submit"
              className="font-mono text-xs uppercase tracking-wide border border-amber text-amber rounded px-5 py-2 hover:bg-amber hover:text-void">
              Crear concurso
            </button>
          </div>
        </form>
      </div>

      {/* Archivo histórico */}
      <div className="bg-paper border border-border-dark p-6 mb-10">
        <h2 className="font-display text-lg mb-1">Archivar concurso pasado</h2>
        <p className="font-mono text-xs text-bone-dim mb-5">Se publica directamente en la sección de concursos anteriores, sin votación.</p>
        <form action={crearArchivoHistorico} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">Año</label>
            <input name="year" type="number" placeholder="Ej: 2023" required
              className="w-full bg-void border border-border-dark rounded px-3 py-2 text-bone font-mono text-sm" />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">Título</label>
            <input name="title" type="text" required placeholder="Ej: Concurso Terror en Corto 2023"
              className="w-full bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm" />
          </div>
          <div className="md:col-span-2">
            <button type="submit"
              className="font-mono text-xs uppercase tracking-wide border border-border-dark text-bone-dim rounded px-5 py-2 hover:border-amber hover:text-amber">
              Crear archivo histórico
            </button>
          </div>
        </form>
      </div>

      {/* Lista de concursos */}
      <div className="flex flex-col gap-10">
        {contests?.map((contest) => {
          const isOpen = contest.is_active && (!contest.ends_at || new Date(contest.ends_at) > now);

          return (
            <div key={contest.id} className="border border-border-dark">
              {/* Header concurso */}
              <div className="bg-paper p-5 flex flex-col gap-4 border-b border-border-dark">
                <div>
                  <span className="font-display text-lg">{contest.title}</span>
                  <span className="font-mono text-xs text-bone-dim ml-3">{contest.year}</span>
                  {contest.ends_at && (
                    <span className="font-mono text-xs text-bone-dim ml-3">
                      · Cierra {new Date(contest.ends_at).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <DeleteContestButton action={eliminarConcurso} id={contest.id} />
                  <form action={toggleConcurso}>
                    <input type="hidden" name="id" value={contest.id} />
                    <input type="hidden" name="is_active" value={(!contest.is_active).toString()} />
                    <button type="submit"
                      className={`font-mono text-xs uppercase tracking-wide rounded px-4 py-2 border ${
                        isOpen
                          ? "border-blood text-blood hover:bg-blood hover:text-bone"
                          : "border-amber text-amber hover:bg-amber hover:text-void"
                      }`}>
                      {contest.is_active ? "Cerrar votación" : "Abrir votación"}
                    </button>
                  </form>
                  {!contest.is_active && (
                    <form action={togglePublicado}>
                      <input type="hidden" name="id" value={contest.id} />
                      <input type="hidden" name="is_published" value={(!contest.is_published).toString()} />
                      <button type="submit"
                        className={`font-mono text-xs uppercase tracking-wide rounded px-4 py-2 border ${
                          contest.is_published
                            ? "border-border-dark text-bone-dim hover:border-blood hover:text-blood"
                            : "border-border-dark text-bone-dim hover:border-amber hover:text-amber"
                        }`}>
                        {contest.is_published ? "Ocultar resultados" : "Publicar resultados"}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Entradas del concurso */}
              <div className="p-5">
                <div className="flex flex-col gap-3 mb-6">
                  {contest.contest_entries?.length === 0 && (
                    <p className="font-mono text-xs text-bone-dim">Sin cortos agregados aún.</p>
                  )}
                  {contest.contest_entries?.map((entry: { id: string; title: string; youtube_url: string; description?: string }) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 border border-border-dark rounded px-4 py-3">
                      <div>
                        <span className="font-semibold text-sm">{entry.title}</span>
                      </div>
                      <form action={eliminarEntrada}>
                        <input type="hidden" name="id" value={entry.id} />
                        <button type="submit" className="font-mono text-xs text-blood hover:text-bone">Eliminar</button>
                      </form>
                    </div>
                  ))}
                </div>

                {/* Marcar ganador */}
                {(contest.contest_entries?.length ?? 0) > 0 && (
                  <form action={marcarGanador} className="flex items-center gap-3 mb-6 border-t border-border-dark pt-5">
                    <input type="hidden" name="id" value={contest.id} />
                    <label className="font-mono text-xs uppercase tracking-wide text-bone-dim shrink-0">Ganador</label>
                    <select name="winner_entry_id" defaultValue={contest.winner_entry_id ?? ""}
                      className="flex-1 bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm font-mono">
                      <option value="">— Sin marcar —</option>
                      {contest.contest_entries?.map((e: { id: string; title: string }) => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                    <button type="submit"
                      className="font-mono text-xs uppercase tracking-wide border border-amber text-amber rounded px-4 py-2 hover:bg-amber hover:text-void shrink-0">
                      Guardar
                    </button>
                  </form>
                )}

                {/* Agregar entrada */}
                <form action={agregarEntrada} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="hidden" name="contest_id" value={contest.id} />
                  <input name="title" type="text" required placeholder="Título del corto"
                    className="bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm" />
                  <input name="youtube_url" type="url" required placeholder="https://youtube.com/watch?v=..."
                    className="bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm font-mono" />
                  <input name="description" type="text" placeholder="Descripción breve (opcional)"
                    className="bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm" />
                  <div className="md:col-span-3">
                    <button type="submit"
                      className="font-mono text-xs uppercase tracking-wide border border-border-dark text-bone-dim rounded px-4 py-2 hover:border-amber hover:text-amber">
                      + Agregar corto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
