import Link from "next/link";
import { Calendar, Users, TrendingUp, ArrowRight } from "lucide-react";
import type { KegiatanRingkas } from "@/lib/types";
import { StatusBadge, JenisBadge } from "./StatusBadge";

interface KegiatanCardProps {
  kegiatan: KegiatanRingkas;
}

function formatTanggal(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function KegiatanCard({ kegiatan }: KegiatanCardProps) {
  const persen =
    kegiatan.target_sampel > 0
      ? Math.min(100, Math.round((kegiatan.realisasi_akhir / kegiatan.target_sampel) * 100))
      : 0;

  const timWarna = kegiatan.tim?.warna ?? "#f97316";

  return (
    <Link href={`/kegiatan/${kegiatan.id}`}>
      <div className="group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 hover:shadow-lg hover:shadow-black/20 transition-all duration-200 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono text-gray-500 mb-1">{kegiatan.kode_kegiatan}</p>
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors">
              {kegiatan.nama_kegiatan}
            </h3>
          </div>
          <StatusBadge status={kegiatan.status} size="sm" />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <JenisBadge jenis={kegiatan.jenis} size="sm" />
          {kegiatan.tim && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{
                color: timWarna,
                borderColor: `${timWarna}40`,
                backgroundColor: `${timWarna}15`,
              }}
            >
              {kegiatan.tim.nama}
            </span>
          )}
          {kegiatan.tahun_rel && (
            <span className="text-[10px] text-gray-500 font-medium">
              {kegiatan.tahun_rel.tahun}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {kegiatan.target_sampel > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Realisasi</span>
              <span className="font-semibold text-white">{persen}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${persen}%`,
                  backgroundColor: persen >= 80 ? "#22c55e" : persen >= 50 ? "#f97316" : "#ef4444",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-600 mt-1">
              <span>{kegiatan.realisasi_akhir.toLocaleString("id-ID")} realisasi</span>
              <span>target {kegiatan.target_sampel.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-auto pt-3 border-t border-gray-800 flex items-center gap-4 text-xs text-gray-500">
          {kegiatan.total_petugas > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{kegiatan.total_petugas} petugas</span>
            </div>
          )}
          {kegiatan.tanggal_selesai && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>s/d {formatTanggal(kegiatan.tanggal_selesai)}</span>
            </div>
          )}
          <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-orange-400" />
        </div>
      </div>
    </Link>
  );
}
