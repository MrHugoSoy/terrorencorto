import PixelAvatar, { pickPixelAvatar } from "@/components/PixelAvatars";

export default function Avatar({
  src,
  seed,
  size = 32,
}: {
  src?: string | null;
  seed?: string | null;
  size?: number;
}) {
  return (
    <span
      className="inline-block rounded-full overflow-hidden bg-paper border border-border-dark shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="w-full h-full object-cover" />
      ) : (
        <PixelAvatar index={pickPixelAvatar(seed || "anonimo")} />
      )}
    </span>
  );
}
