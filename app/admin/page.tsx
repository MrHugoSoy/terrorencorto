import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function actualizarEstado(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const video_url = formData.get("video_url") as string;

  const updates: Record<string, unknown> = { status };
  if (status === "publicado" || status === "seleccionado_canal") {
    updates.published_at = new Date().toISOString();
  }
  if (video_url) {
    updates.video_url = video_url;
  }

  await supabase.from("stories").update(updates).eq("id", id);
  revalidatePath("/admin");
}

const ESTADOS = [
  "pendiente",
  "publicado",
  "seleccionado_canal",
  "usado_canal",
  "rechazado",
] as const;

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
    .select("id, title, content, status, mode, channel_consent, video_url, case_number, created_at, profiles(username)")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      <h1 className="font-display text-2xl mb-2">Cola de moderación</h1>
      <p className="text-bone-dim text-sm mb-10">
        Marca como &quot;publicado&quot; lo que va al sitio. Marca como &quot;seleccionado para canal&quot;
        lo que entra a tu cola de guiones para @terrorencorto.
      </p>

      <div className="flex flex-col gap-4">
        {stories?.map((story) => (
          <form
            key={story.id}
            action={actualizarEstado}
            className="bg-paper border border-border-dark p-5 flex flex-col md:flex-row md:items-center gap-4"
          >
            <input type="hidden" name="id" value={story.id} />

            <div className="flex-1">
              <div className="font-mono text-xs text-bone-dim mb-1">
                {story.case_number} · {story.mode === "incognito" ? "incógnito" : `@${(story.profiles as { username?: string } | null)?.username}`}
                {story.channel_consent && (
                  <span className="text-amber"> · autoriza uso en canal</span>
                )}
              </div>
              <div className="font-semibold">{story.title}</div>
              <p className="text-bone-dim text-sm line-clamp-2 mt-1">{story.content}</p>
            </div>

            <div className="flex flex-col gap-2 md:w-56">
              <select
                name="status"
                defaultValue={story.status}
                className="bg-void border border-border-dark rounded px-3 py-2 text-sm font-mono"
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
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
            </div>
          </form>
        ))}
      </div>
    </main>
  );
}
