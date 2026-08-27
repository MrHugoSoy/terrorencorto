export default function Avatar({
  src,
  size = 32,
}: {
  src?: string | null;
  size?: number;
}) {
  return (
    <span
      className="inline-block rounded-full overflow-hidden bg-paper border border-border-dark shrink-0"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || "/logo.svg"}
        alt=""
        className={`w-full h-full ${src ? "object-cover" : "object-contain p-0.5"}`}
      />
    </span>
  );
}
