const BONE = "#e6dfd0";
const BLOOD = "#d62839";
const AMBER = "#c2954f";

// grids de 8x8: 0 = vacío, 1 = trazo principal, 2 = acento
const GRIDS: number[][][] = [
  // calavera
  [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,2,1,1,2,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,0,1,1,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,1,0,0,1,0,0],
  ],
  // fantasma
  [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,2,1,1,2,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1,0],
  ],
  // ojo
  [
    [0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,2,2,1,1,1],
    [1,1,1,2,2,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  // murciélago
  [
    [0,1,0,0,0,0,1,0],
    [1,1,1,0,0,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,2,2,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  // araña
  [
    [1,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,0],
    [0,0,1,1,1,1,0,0],
    [1,1,1,2,2,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,0,0],
    [0,1,0,1,1,0,1,0],
    [1,0,1,0,0,1,0,1],
  ],
  // vela
  [
    [0,0,0,2,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
  ],
];

export function pickPixelAvatar(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i);
  return hash % GRIDS.length;
}

export default function PixelAvatar({ index }: { index: number }) {
  const grid = GRIDS[index % GRIDS.length];
  const colors = [null, BONE, index % 3 === 0 ? BLOOD : AMBER];

  return (
    <svg viewBox="0 0 8 8" shapeRendering="crispEdges" className="w-full h-full">
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell === 0 ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[cell]!} />
          )
        )
      )}
    </svg>
  );
}
