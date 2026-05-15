import { TableRow, TableCell } from "../ui/table";

const AllProductTableSkeletonRow = () => {
    return (
        <TableRow className="animate-pulse pointer-events-none">
            {/* Product */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-40 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Category */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-28 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* City */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-24 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Price */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-20 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Stock */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-16 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>

            {/* Created */}
            <TableCell className="px-4 py-4">
                <div className="h-3 w-24 rounded bg-slate-300/50 dark:bg-slate-700/50" />
            </TableCell>
        </TableRow>
    );
};

export default AllProductTableSkeletonRow;
