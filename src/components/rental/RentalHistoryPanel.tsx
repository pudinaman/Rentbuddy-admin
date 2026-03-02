import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { BarcodeRecord } from "../tables/RentalStockPage";

interface Props {
  selectedBarcode: BarcodeRecord | null;
  onBack: () => void;
}

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const RentalHistoryPanel: React.FC<Props> = ({ selectedBarcode, onBack }) => {
  if (!selectedBarcode) return null;

  const history = selectedBarcode.rentalHistory || [];

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:-translate-y-[1px] hover:bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.28)] backdrop-blur-xl  dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        <span>←</span>
        <span>Back</span>
      </button>

      {/* Header info */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Rental History – {selectedBarcode.rentalItem?.productName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Barcode:{" "}
            <span className="font-mono text-[11px]">
              {selectedBarcode.brID}
            </span>
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600 ring-1 ring-inset ring-blue-500/40 dark:text-blue-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {history.length} record{history.length !== 1 ? "s" : ""}
        </span>
      </div>

      {history.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400">
          No rental history available for this item yet.
        </p>
      ) : (
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table className="min-w-[800px] text-xs">
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-[11px] uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-3 py-2">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-3 py-2">
                  Email
                </TableCell>
                <TableCell isHeader className="px-3 py-2">
                  Order ID
                </TableCell>
                <TableCell isHeader className="px-3 py-2">
                  From
                </TableCell>
                <TableCell isHeader className="px-3 py-2">
                  Till
                </TableCell>
                <TableCell isHeader className="px-3 py-2">
                  Rent
                </TableCell>
                <TableCell isHeader className="px-3 py-2">
                  Return Condition
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {history.map((h) => (
                <TableRow
                  key={h._id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200"
                >
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">
                    {h.customerID?.username}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">
                    {h.customerID?.email}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">{h.orderID}</TableCell>
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">
                    {formatDate(h.rentedDate)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">
                    {formatDate(h.rentedTill)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">
                    ₹{h.rentalPrice?.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-gray-dark dark:text-white">
                    {h.conditionAtReturn || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RentalHistoryPanel;
