import { CheckCircle2, Circle, Clock, ChevronRight } from "lucide-react";
import type { Fase, StatusFase } from "@/lib/types";

function formatTanggal(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_ICONS: Record<StatusFase, React.ReactNode> = {
  selesai:     <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />,
  berjalan:    <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 animate-pulse" />,
  belum_mulai: <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" />,
};

const STATUS_LABELS: Record<StatusFase, string> = {
  selesai:     "Selesai",
  berjalan:    "Sedang berjalan",
  belum_mulai: "Belum dimulai",
};

interface FaseTimelineProps {
  fase: Fase[];
}

export default function FaseTimeline({ fase }: FaseTimelineProps) {
  if (!fase || fase.length === 0) {
    return (
      <div className="text-gray-500 text-sm py-4">
        Belum ada fase yang ditambahkan untuk kegiatan ini.
      </div>
    );
  }

  const sorted = [...fase].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="space-y-0">
      {sorted.map((f, idx) => {
        const isLast = idx === sorted.length - 1;
        return (
          <div key={f.id} className="flex gap-4">
            {/* Icon & connector */}
            <div className="flex flex-col items-center">
              <div className="mt-0.5">{STATUS_ICONS[f.status]}</div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 ${
                  f.status === "selesai" ? "bg-green-800" : "bg-gray-800"
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-medium ${
                    f.status === "berjalan"
                      ? "text-orange-400"
                      : f.status === "selesai"
                      ? "text-white"
                      : "text-gray-500"
                  }`}>
                    {f.nama_fase}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {STATUS_LABELS[f.status]}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 flex-shrink-0">
                  {f.tanggal_mulai && (
                    <p>{formatTanggal(f.tanggal_mulai)}</p>
                  )}
                  {f.tanggal_selesai && (
                    <p>s/d {formatTanggal(f.tanggal_selesai)}</p>
                  )}
                </div>
              </div>
              {f.catatan && (
                <p className="mt-1 text-xs text-gray-600 italic">{f.catatan}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
