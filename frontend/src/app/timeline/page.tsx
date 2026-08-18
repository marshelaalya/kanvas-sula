import Link from "next/link";
import { ArrowLeft, Calendar, Layers, Clock, ArrowRight } from "lucide-react";
import { kegiatanApi, metaApi } from "@/lib/api";
import type { KegiatanRingkas, Tim } from "@/lib/types";

export const dynamic = "force-dynamic";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

export default async function TimelineOperationalPage() {
  let allKegiatan: KegiatanRingkas[] = [];
  let timList: Tim[] = [];

  try {
    const [resKegiatan, resTim] = await Promise.all([
      kegiatanApi.list({ per_page: 60 }),
      metaApi.tim(),
    ]);
    allKegiatan = resKegiatan.items;
    timList = resTim;
  } catch (err) {
    console.error(err);
  }

  // Helper to determine active months of a survey
  const getActiveMonths = (k: KegiatanRingkas): number[] => {
    if (!k.tanggal_mulai && !k.tanggal_selesai) {
      // Fallback based on survey code
      if (k.kode_kegiatan.includes("SUSENAS")) return [2, 8]; // Mar & Sep (0-indexed)
      if (k.kode_kegiatan.includes("SAKERNAS")) return [1, 7]; // Feb & Aug
      if (k.kode_kegiatan.includes("SE2026")) return [6, 7]; // Jul & Aug
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    const start = k.tanggal_mulai ? new Date(k.tanggal_mulai).getMonth() : 0;
    const end = k.tanggal_selesai ? new Date(k.tanggal_selesai).getMonth() : start;
    const result: number[] = [];
    for (let m = start; m <= end; m++) {
      result.push(m);
    }
    return result;
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-2">
          <span>ROADMAP OPERASIONAL TAHUNAN</span>
          <span>•</span>
          <span>TAHUN ANGGARAN 2026</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Timeline & Kalender Operasional Statistik 2026
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Peta jalan komprehensif jadwal pelaksanaan pencacahan, pelatihan petugas, dan pengolahan data
          seluruh kegiatan statistik sepanjang 12 bulan untuk mitigasi beban kerja lapangan.
        </p>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Keterangan Fase:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-emerald-500/80" /> Sedang Berjalan
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-sky-500/80" /> Telah Selesai
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-slate-700" /> Terjadwal / Perencanaan
          </span>
        </div>
      </div>

      {/* ── 12-MONTH MATRIX ROADMAP GROUPED BY TIM ── */}
      <div className="space-y-8">
        {timList.map((tim) => {
          const itemsInTim = allKegiatan.filter((k) => k.tim?.id === tim.id);
          if (itemsInTim.length === 0) return null;

          return (
            <div key={tim.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              {/* Team Group Header */}
              <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <h2 className="text-sm font-bold text-white">
                    Tim {tim.nama}
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ({itemsInTim.length} Kegiatan)
                  </span>
                </div>
                <Link
                  href={`/tim/${tim.kode}`}
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1"
                >
                  Buka Profil Tim <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                      <th className="py-2.5 px-4 min-w-[240px]">Kegiatan Statistik</th>
                      {MONTHS.map((m, idx) => (
                        <th
                          key={m}
                          className={`py-2.5 px-2 text-center w-12 font-mono text-[10px] ${
                            idx === 7 ? "bg-sky-950/30 text-sky-400 font-bold border-x border-sky-900/40" : ""
                          }`}
                        >
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-300">
                    {itemsInTim.map((k) => {
                      const activeMonths = getActiveMonths(k);
                      return (
                        <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-4">
                            <Link
                              href={`/kegiatan/${k.id}`}
                              className="font-medium text-white hover:text-sky-400 transition-colors truncate block max-w-xs"
                            >
                              {k.nama_kegiatan}
                            </Link>
                            <span className="text-[10px] font-mono text-slate-500">
                              {k.kode_kegiatan} • {k.platform.toUpperCase()}
                            </span>
                          </td>
                          {MONTHS.map((_, idx) => {
                            const isActiveMonth = activeMonths.includes(idx);
                            const isCurrentMonth = idx === 7; // August (0-indexed)

                            let barColor = "bg-slate-800";
                            if (isActiveMonth) {
                              if (k.status === "berjalan") barColor = "bg-emerald-500/80";
                              else if (k.status === "selesai") barColor = "bg-sky-500/70";
                              else barColor = "bg-slate-600";
                            }

                            return (
                              <td
                                key={idx}
                                className={`py-2 px-1 text-center ${
                                  isCurrentMonth ? "bg-sky-950/20 border-x border-sky-900/30" : ""
                                }`}
                              >
                                {isActiveMonth && (
                                  <div
                                    className={`h-4 rounded-sm ${barColor} mx-auto w-full transition-opacity hover:opacity-80`}
                                    title={`${k.nama_kegiatan} (${MONTHS[idx]} 2026)`}
                                  />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
