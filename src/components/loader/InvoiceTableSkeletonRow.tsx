import React from "react";
import { TableRow, TableCell } from "../ui/table";

const InvoiceTableSkeletonRow: React.FC = () => {
  return (
    <TableRow className="animate-pulse pointer-events-none">
      {/* Customer / Invoice */}
      <TableCell className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-300/50 dark:bg-slate-700/50" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            <div className="h-2 w-40 rounded bg-slate-200/40 dark:bg-slate-800/40" />
            <div className="h-2 w-24 rounded bg-slate-200/40 dark:bg-slate-800/40" />
          </div>
        </div>
      </TableCell>

      {/* Date */}
      <TableCell className="px-4 py-4">
        <div className="h-3 w-24 rounded bg-slate-300/50 dark:bg-slate-700/50" />
      </TableCell>

      {/* Email */}
      <TableCell className="px-4 py-4">
        <div className="h-3 w-40 rounded bg-slate-300/50 dark:bg-slate-700/50" />
      </TableCell>

      {/* Phone */}
      <TableCell className="px-4 py-4">
        <div className="h-3 w-28 rounded bg-slate-300/50 dark:bg-slate-700/50" />
      </TableCell>

      {/* Amount */}
      <TableCell className="px-4 py-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded bg-slate-300/50 dark:bg-slate-700/50" />
          <div className="h-2 w-28 rounded bg-slate-200/40 dark:bg-slate-800/40" />
        </div>
      </TableCell>

      {/* Payment */}
      <TableCell className="px-4 py-4">
        <div className="space-y-2">
          <div className="h-2 w-20 rounded bg-slate-300/50 dark:bg-slate-700/50" />
          <div className="h-2 w-28 rounded bg-slate-200/40 dark:bg-slate-800/40" />
        </div>
      </TableCell>

      {/* Subscription */}
      <TableCell className="px-4 py-4">
        <div className="h-5 w-24 rounded-full bg-slate-300/50 dark:bg-slate-700/50" />
      </TableCell>
    </TableRow>
  );
};

export default InvoiceTableSkeletonRow;
