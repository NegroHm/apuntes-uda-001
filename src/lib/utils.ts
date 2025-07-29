import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type z } from "zod";

import { Schema_Breadcrumb, type Schema_Config_Site } from "~/types/schema";

import config from "config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFooterContent(
  text: { value: string }[],
  siteConfig?: z.infer<typeof Schema_Config_Site>,
): string {
  const data = siteConfig ?? config.siteConfig;
  const formatMap = {
    year: new Date().getFullYear().toString(),
    repository: "[Source Code](https://github.com/mbaharip/next-gdrive-index)",
    poweredBy: `Powered by [next-gdrive-index v${config.version}](https://github.com/mbaharip/next-gdrive-index)`,
    author: data.siteAuthor ?? "mbaharip",
    version: config.version ?? "0.0.0",
    siteName: data.siteName ?? "next-gdrive-index",
    handle: data.twitterHandle ?? "@__mbaharip__",
    creator: "mbaharip",
  };

  return text
    .map((item) => item.value.trim())
    .join("\n")
    .replace(/{{\s*(\w+)\s*}}/g, (_, key) => formatMap[key as keyof typeof formatMap] ?? "");
}

export const formatDate = (dateString: string | null | undefined): string => {
  // Si no hay fecha, devuelve un guion.
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  // Comprueba si la fecha es inválida. Si lo es, devuelve un guion.
  if (isNaN(date.getTime())) {
    return '-';
  }

  // Si la fecha es válida, la formatea y la devuelve.
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export function bytesToReadable(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return (i >= 2 ? value.toFixed(2) : Math.round(value)) + " " + sizes[i];
}

export function durationToReadable(durationMillis: number): string {
  const duration = durationMillis / 1000;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const hStr = hours > 0 ? `${hours.toString().padStart(2, "0")}:` : "";
  const mStr = minutes > 0 ? `${minutes.toString().padStart(2, "0")}:` : "00:";
  const sStr = seconds > 0 ? `${seconds.toString().padStart(2, "0")}` : "00";

  return `${hStr}${mStr}${sStr}`;
}

export function toUrlPath(paths: { path: string; id: string }[]): string {
  const data = ["/"];
  for (const { path } of paths) {
    data.push(path);
  }
  return data.join("/").replace(/\/+/g, "/");
}

export function formatPathToBreadcrumb(
  paths: { id: string; path: string; mimeType: string }[],
): z.infer<typeof Schema_Breadcrumb>[] {
  const breadcrumb = paths.map((item, index) => {
    const isLast = index === paths.length - 1;
    return {
      label: decodeURIComponent(item.path),
      href: isLast ? undefined : item.path,
    };
  });
  const parsed = Schema_Breadcrumb.array().safeParse(breadcrumb);
  if (!parsed.success) throw new Error("Failed to parse breadcrumb");
  return parsed.data;
}
