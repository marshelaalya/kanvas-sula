import type { StatusKegiatan, JenisKegiatan } from "@/lib/types";

const STATUS_CONFIG: Record<StatusKegiatan, { label: string; className: string; dot: string }> = {
  perencanaan:  { label: "Perencanaan",  className: "bg-blue-500/15 text-blue-400 border-blue-500/30",   dot: "bg-blue-400" },
  berjalan:     { label: "Berjalan",     className: "bg-green-500/15 text-green-400 border-green-500/30",  dot: "bg-green-400 animate-pulse" },
  selesai:      { label: "Selesai",      className: "bg-gray-500/15 text-gray-400 border-gray-500/30",    dot: "bg-gray-400" },
  ditangguhkan: { label: "Ditangguhkan", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-400" },
  diarsipkan:   { label: "Diarsipkan",   className: "bg-purple-500/15 text-purple-400 border-purple-500/30", dot: "bg-purple-400" },
};

const JENIS_CONFIG: Record<JenisKegiatan, { label: string; className: string }> = {
  survei:    { label: "Survei",    className: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  sensus:    { label: "Sensus",    className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  updating:  { label: "Updating",  className: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  pendataan: { label: "Pendataan", className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  lainnya:   { label: "Lainnya",   className: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
};

interface StatusBadgeProps {
  status: StatusKegiatan;
  showDot?: boolean;
  size?: "sm" | "md";
}

interface JenisBadgeProps {
  jenis: JenisKegiatan;
  size?: "sm" | "md";
}

export function StatusBadge({ status, showDot = true, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.perencanaan;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const px = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${textSize} ${px} ${config.className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
}

export function JenisBadge({ jenis, size = "md" }: JenisBadgeProps) {
  const config = JENIS_CONFIG[jenis] ?? JENIS_CONFIG.lainnya;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const px = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${textSize} ${px} ${config.className}`}>
      {config.label}
    </span>
  );
}
