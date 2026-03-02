import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { barcodeService } from "../../services/barcodeService";
import { useNavigate, useParams } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";

const STATUS_FILTERS = ["all", "available", "rented", "damaged", "retired"];

export default function ProductBarcodeTable() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const { data: barcodeData, isLoading, isError, error } = useQuery({
    queryKey: ["productBarcodes", productId, page],
    queryFn: () => barcodeService.getBarcodesByProductId(productId!, page, 10),
    enabled: !!productId,
  });

  const barcodes = barcodeData?.data || [];
  const totalPages = barcodeData?.totalPages || 1;

  /* ---------------- Stats ---------------- */
  const stats = useMemo(() => {
    const base = { total: 0, available: 0, rented: 0, damaged: 0 };
    barcodes.forEach((b: any) => {
      base.total++;
      if (base[b.status as keyof typeof base] !== undefined) {
        base[b.status as keyof typeof base]++;
      }
    });
    return base;
  }, [barcodes]);

  /* ---------------- Filtered rows ---------------- */
  const filteredBarcodes = useMemo(() => {
    if (filter === "all") return barcodes;
    return barcodes.filter((b: any) => b.status === filter);
  }, [barcodes, filter]);
  console.log("Filtered Barcodes:", filteredBarcodes);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">

      {/* Ambient glow accents (SAME AS PRODUCT TABLE) */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative">
        {/* ---------------- Header + Filter ---------------- */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Product Barcodes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track barcode lifecycle, rentals, and condition.
            </p>
          </div>

          {/* Status Filter (same input styling as search) */}
          <div className="relative w-full sm:w-56">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---------------- Stats ---------------- */}
        <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Available" value={stats.available} tone="emerald" />
          <StatCard label="Rented" value={stats.rented} tone="amber" />
          <StatCard label="Damaged" value={stats.damaged} tone="rose" />
        </div>

        {/* ---------------- Table ---------------- */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 text-left font-semibold">
                  Barcode ID
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-left font-semibold">
                  ProductSerial ID
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-center font-semibold">
                  Status
                </TableCell>
                <TableCell isHeader className="px-4 py-3 text-right font-semibold">
                  Last Updated
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-blue-600">
                    Loading barcodes...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-red-600">
                    {error?.message || "Failed to load barcodes"}
                  </TableCell>
                </TableRow>
              ) : filteredBarcodes.length > 0 ? (
                filteredBarcodes.map((b: any) => (
                  <TableRow
                    key={b._id}
                    onClick={() => navigate(`/barcodes/${b._id}`)}
                    className="group cursor-pointer border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                  >
                    <TableCell className="px-4 py-4 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {b.brID}
                    </TableCell>
                    <TableCell className="px-4 py-4 font-mono text-xs text-slate-900 dark:text-slate-100">
                      {b.rentalItem.productSerialID}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <StatusBadge status={b.status} />
                    </TableCell>

                    <TableCell className="px-4 py-4 text-right text-sm text-slate-700 dark:text-slate-300">
                      {new Date(b.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <td
                    colSpan={3}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No barcodes found.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ---------------- Pagination (SAME FOOTER STYLE) ---------------- */}
        {totalPages > 1 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {page}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                of {totalPages} pages
              </span>
            </p>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              windowSize={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI Components (unchanged logic) ---------------- */

function StatCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "emerald" | "amber" | "rose";
}) {
  const toneMap: Record<string, string> = {
    slate: "text-slate-700 dark:text-slate-200",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500",
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/40 p-4 text-center backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${toneMap[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40",
    rented: "bg-amber-500/10 text-amber-400 ring-amber-500/40",
    damaged: "bg-rose-500/10 text-rose-400 ring-rose-500/40",
    retired: "bg-slate-500/10 text-slate-400 ring-slate-500/40",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset ${map[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
