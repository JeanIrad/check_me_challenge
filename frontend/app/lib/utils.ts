import type { SeverityTrend } from "../types";

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_PAIRS: [string, string][] = [
  ["#0e7490", "#67e8f9"],
  ["#065f46", "#6ee7b7"],
  ["#4c1d95", "#c4b5fd"],
  ["#7c2d12", "#fdba74"],
  ["#1e3a8a", "#93c5fd"],
  ["#831843", "#f9a8d4"],
  ["#14532d", "#86efac"],
  ["#1e40af", "#bfdbfe"],
];

export function avatarColor(name: string): [string, string] {
  const i = name.charCodeAt(0) % AVATAR_PAIRS.length;
  return AVATAR_PAIRS[i];
}

export function severityColor(s: number): string {
  return (
    ["", "#34d399", "#a3e635", "#fbbf24", "#f97316", "#f87171"][s] ?? "#8fa3bc"
  );
}

export function trendIcon(trend: SeverityTrend | undefined): string {
  if (trend === "worsening") return "↑";
  if (trend === "improving") return "↓";
  if (trend === "stable") return "→";
  return "?";
}

export function trendClass(trend: SeverityTrend | undefined): string {
  return trend ?? "insufficient_data";
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  data: T[];
  total: number;
  totalPages: number;
} {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return { data: items.slice(start, start + pageSize), total, totalPages };
}
