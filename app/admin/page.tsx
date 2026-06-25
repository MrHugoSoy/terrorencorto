import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteStoryButton from "./DeleteStoryButton";

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
  if (video_url) {
    updates.video_url = video_url;
  }

  await supabase.from("stories").update(updates).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/archivo");
}

async function eliminarHistoria(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("stories").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/archivo");
}

const ESTADOS = [
  "pendiente",
  "publicado",
  "seleccionado_canal",
  "usado_canal",
  "rechazado",
] as const;

function StoryCard({ story, action, deleteAction }: {
  story: {
    id: string; title: string; content: string; status: string; category: string | null;
    mode: string; channel_consent: boolean; video_url: string | null;
    case_number: string | null; profiles: { username?: string } | null;
  };
  action: (f: FormData) => Promise<void>;
  deleteAction: (f: FormData) => Promise<void>;
}) {
  return (
    <form
      action={action}
      className="bg-paper border border-border-dark p-5 flex flex-col md:flex-row md:items-start gap-4"
    >
      <input type="hidden" name="id" value={story.id} />

      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs text-bone-dim mb-1">
          {story.case_number} · {story.mode === "incognito" ? "incógnito" : `@${story.profiles?.username ?? "anonimo"}`}
          {story.channel_consent && (
            <span className="text-amber"> · autoriza uso en canal</span>
          )}
        </div>
        <div className="font-semibold mb-1">{story.title}</div>
        <p className="text-bone-dim text-sm mt-1 leading-relaxed">{story.content}</p>
        <Link
          href={`/historias/${story.id}`}
          target="_blank"
          className="inline-block mt-3 font-mono text-xs text-bone-dim underline hover:text-amber"
        >
          Ver historia completa →
        </Link>
      </div>

      <div className="flex flex-col gap-2 md:w-56 shrink-0">
        <select
          name="category"
          defaultValue={story.category ?? "sin_resolver"}
          className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono"
        >
          <option value="sin_resolver">Sin resolver</option>
          <option value="testimonio_real">Testimonio real</option>
          <option value="archivado">Archivado</option>
        </select>
        <select
          name="status"
          defaultValue={story.status}
          className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono"
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
        <input
          name="video_url"
          placeholder="link del video (opcional)"
          defaultValue={story.video_url ?? ""}
          className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono"
        />
        <button
          type="submit"
          className="font-mono text-xs uppercase tracking-wide border border-amber text-amber rounded py-2 hover:bg-amber hover:text-void"
        >
          Guardar
        </button>
        <DeleteStoryButton action={deleteAction} id={story.id} />
      </div>
    </form>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, content, status, category, mode, channel_consent, video_url, case_number, created_at, profiles(username)")
    .order("created_at", { ascending: false });

  const pendientes = stories?.filter(s => s.status === "pendiente") ?? [];
  const publicadas = stories?.filter(s => s.status !== "pendiente") ?? [];

  return (
    <main className="max-w-325 mx-auto px-8 py-16">
      <h1 className="font-display text-2xl mb-2">Cola de moderación</h1>
      <p className="text-bone-dim text-sm mb-10">
        Las historias pendientes aparecen aquí. Al guardar como &quot;publicado&quot; desaparecen de la cola.
      </p>

      {/* Cola pendiente */}
      <div className="flex flex-col gap-4 mb-20">
        {pendientes.length === 0 && (
          <p className="font-mono text-xs text-bone-dim py-8 text-center border border-border-dark rounded">
            La cola está vacía — no hay historias pendientes.
          </p>
        )}
        {pendientes.map((story) => (
          <StoryCard
            key={story.id}
            story={{ ...story, profiles: story.profiles as { username?: string } | null }}
            action={actualizarEstado}
            deleteAction={eliminarHistoria}
          />
        ))}
      </div>

      {/* Historias ya publicadas */}
      {publicadas.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-1 border-t border-border-dark pt-10">Historias publicadas</h2>
          <p className="text-bone-dim text-sm mb-6">Puedes cambiar categoría, agregar video o eliminar.</p>
          <div className="flex flex-col gap-4">
            {publicadas.map((story) => (
              <StoryCard
                key={story.id}
                story={{ ...story, profiles: story.profiles as { username?: string } | null }}
                action={actualizarEstado}
                deleteAction={eliminarHistoria}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
