"use client";

import { useEffect, useState } from "react";

export default function RecTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-blood mb-7">
      <span className="w-2 h-2 rounded-full bg-blood inline-block animate-pulse" />
      <span>REC</span>
      <span className="text-bone-dim">{h}:{m}:{s}</span>
    </div>
  );
}
