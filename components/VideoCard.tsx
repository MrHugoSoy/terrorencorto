"use client";

import { useState } from "react";
import { getYouTubeId } from "@/lib/youtube";
import ShareButtons from "@/components/ShareButtons";

export default function VideoCard({
  youtubeUrl,
  title,
  description,
  badge,
  winner = false,
  shareUrl,
  children,
}: {
  youtubeUrl: string;
  title: string;
  description?: string | null;
  badge?: { texto: string; clase?: string };
  winner?: boolean;
  shareUrl?: string;
  children?: React.ReactNode;
}) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(youtubeUrl);

  return (
    <div
      className={`bg-paper border transition-colors flex flex-col ${
        winner ? "border-amber" : "border-border-dark hover:border-amber"
      }`}
    >
      {videoId && (
        <div className="aspect-video relative bg-void">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              aria-label={`Reproducir ${title}`}
              className="group relative block w-full h-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
              <span className="absolute inset-0 bg-linear-to-t from-void/80 via-transparent to-void/20" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-blood-deep border border-blood flex items-center justify-center group-hover:bg-blood group-hover:border-amber transition-colors">
                  <span className="ml-1 border-y-8 border-y-transparent border-l-13 border-l-bone" />
                </span>
              </span>
            </button>
          )}
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {badge && <span className={`stamp ${badge.clase ?? ""} mb-3 self-start`}>{badge.texto}</span>}
        <span className="font-semibold text-base leading-snug">{title}</span>
        {description && (
          <p className="text-bone-dim text-sm leading-relaxed mt-2 line-clamp-3">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-dark">
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs px-3 py-1.5 rounded border border-border-dark text-bone-dim hover:border-amber hover:text-amber transition-colors"
          >
            Mirar en YouTube ↗
          </a>
          {shareUrl && <ShareButtons url={shareUrl} title={title} />}
        </div>
      </div>
    </div>
  );
}
