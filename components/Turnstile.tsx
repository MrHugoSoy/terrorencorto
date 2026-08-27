"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string }) => void;
    };
  }
}

export default function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    function render() {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, { sitekey: siteKey! });
      }
    }

    if (window.turnstile) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
  }, [siteKey]);

  if (!siteKey) return null;

  return <div ref={ref} />;
}
