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
  barcodes: BarcodeRecord[];
  onSelectBarcode: (b: BarcodeRecord) => void;
}

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "-";

const BarcodeTable: React.FC<Props> = ({ barcodes, onSelectBarcode }) => {
  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-[0_18px_40px_rgba(15,23,42,0.28)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40 table-scrollbar">
      <Table className="min-w-[950px]">
        <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
          <TableRow>
            <TableCell isHeader className="px-4 py-3 font-semibold">
              Product Name
            </TableCell>

            <TableCell isHeader className="px-4 py-3 font-semibold">
              Serial No.
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-semibold">
              Duration
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-semibold">
              Rent Price
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-semibold">
              Current Customer
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-semibold">
              Rented From
            </TableCell>
            <TableCell isHeader className="px-4 py-3 font-semibold">
              Rented Till
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-white/10 dark:divide-white/10">
          {barcodes.length === 0 ? (
            <TableRow className="border-0">
              <TableCell
                colSpan={8}
                className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
              >
                No barcodes found for this product.
              </TableCell>
            </TableRow>
          ) : (
            barcodes.map((b) => (
              <TableRow
                key={b._id}
                className="group border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200 cursor-pointer"
                onClick={() => onSelectBarcode(b)}
              >
                <TableCell className="px-4 py-4 text-sm text-slate-800 dark:text-slate-100 text-left">
                  {b.rentalItem?.productName || "-"}
                </TableCell>

                <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {b.rentalItem?.productSerialID || "-"}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {b.rentalItem?.rentalDuration || "-"}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm text-slate-800 dark:text-slate-200">
                  <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
                    ₹{b.rentalItem?.rentalPrice?.toFixed(2) ?? "-"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {b.currentRental?.customerID?.username || (
                    <span className="text-xs italic text-slate-400">
                      Not rented
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(b.currentRental?.rentedDate)}
                </TableCell>
                <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                  {formatDate(b.currentRental?.rentedTill)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BarcodeTable;
