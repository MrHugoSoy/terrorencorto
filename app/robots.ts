import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/perfil"],
    },
    sitemap: "https://terrorencorto.com/sitemap.xml",
  };
}
