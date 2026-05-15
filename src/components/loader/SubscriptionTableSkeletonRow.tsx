import React from "react";
import { TableRow, TableCell } from "../ui/table";

const SubscriptionTableSkeletonRow: React.FC = () => {
    return (
        <TableRow className="animate-pulse pointer-events-none">
            {/* Subscription ID */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-32 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Customer */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-28 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Email */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-40 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Plan Amount */}
            <TableCell className="px-4 py-4 text-center">
                <div className="mx-auto h-3 w-20 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Status */}
            <TableCell className="px-4 py-4">
                <div className="h-5 w-24 rounded-full bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Next Charge */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-24 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Remaining */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-20 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Action */}
            <TableCell className="px-4 py-4 text-center">
                <div className="mx-auto h-7 w-16 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>
        </TableRow>
    );
};

export default SubscriptionTableSkeletonRow;
