import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mirvory - متجر الكوتشيات والملابس",
    short_name: "Mirvory",
    description: "منصة تجارة إلكترونية متعددة التجار متخصصة في بيع الكوتشيات الميرور والملابس",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/vo-logo.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
