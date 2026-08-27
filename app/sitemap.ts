import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const DOMAIN = "https://terrorencorto.com";

const STATIC_ROUTES = ["", "/archivo", "/concurso", "/videos", "/enviar", "/login", "/registro"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, created_at")
    .in("status", ["publicado", "seleccionado_canal", "usado_canal"]);

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${DOMAIN}${route}`,
    lastModified: new Date(),
  }));

  const storyEntries = (stories ?? []).map((story) => ({
    url: `${DOMAIN}/historias/${story.id}`,
    lastModified: new Date(story.created_at),
  }));

  return [...staticEntries, ...storyEntries];
}
