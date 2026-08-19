import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DOMAIN = "https://terrorencorto.com";
const DESCRIPTION =
  "Las historias narradas del canal de Terror en Corto: testimonios reales, leyendas urbanas y encuentros sin explicación, directo desde YouTube.";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

const getVideos = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("channel_videos")
    .select("id, title, youtube_url, description, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
});

export async function generateMetadata(): Promise<Metadata> {
  const videos = await getVideos();
  const url = `${DOMAIN}/videos`;
  const latestId = videos[0] ? getYouTubeId(videos[0].youtube_url) : null;
  const ogImage = latestId ? `https://img.youtube.com/vi/${latestId}/hqdefault.jpg` : null;

  return {
    title: "Videos del canal",
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: "Videos del canal — Terror en Corto",
      description: DESCRIPTION,
      url,
      type: "website",
      siteName: "Terror en Corto",
      ...(ogImage ? { images: [{ url: ogImage, width: 480, height: 360 }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: "Videos del canal — Terror en Corto",
      description: DESCRIPTION,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <main className="max-w-325 mx-auto px-8 py-16">
      <div className="border-b border-border-dark pb-8 mb-12">
        <p className="font-mono text-xs text-blood uppercase tracking-widest mb-3">Terror en Corto</p>
        <h1 className="font-display text-4xl mb-4">Videos del canal</h1>
        <p className="text-bone-dim">Las historias narradas, directo desde YouTube.</p>
      </div>

      {!videos.length ? (
        <p className="font-mono text-xs text-bone-dim py-8 text-center border border-border-dark rounded">
          Todavía no hay videos publicados.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video) => {
            const videoId = getYouTubeId(video.youtube_url);
            return (
              <div key={video.id} className="bg-paper border border-border-dark">
                {videoId && (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="font-semibold text-lg">{video.title}</span>
                  {video.description && (
                    <p className="text-bone-dim text-sm leading-relaxed mt-2">{video.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
