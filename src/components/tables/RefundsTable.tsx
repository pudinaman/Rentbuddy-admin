import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../../services/paymentService";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import Avatar from "../ui/avatar/Avatar";
import ModalWrapper from "../../layout/ModalWrapper";
import { toast } from "react-toastify";
import { RotateCcw } from "lucide-react";
import PaymentsTableSkeletonRow from "../loader/PaymentsTableSkeletonRow";

type PaymentRow = {
    id: string;          // MongoDB internal _id
    paymentId: string;   // Razorpay pay_... ID
    orderId: string;
    customerName: string;
    email: string;
    amount: number;      // Original Amount (INR)
    refundedSoFar: number; // Refunded already (INR)
    refundStatus: string;
    paymentDate: string;
    raw: any;
};

interface RefundsTableProps {
    allowedRoles?: string[];
}

export default function RefundsTable({ allowedRoles }: RefundsTableProps) {
    const queryClient = useQueryClient();

    const userRaw = localStorage.getItem("user");
    const currentUser = userRaw ? JSON.parse(userRaw) : null;
    const userRole = currentUser?.role?.toLowerCase();
    const canAction = allowedRoles?.includes("admin") && userRole === "admin";
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const [selectedRow, setSelectedRow] = useState<PaymentRow | null>(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundAmount, setRefundAmount] = useState<string>("");

    const { data: paymentData, isLoading } = useQuery({
        queryKey: ["payments", page],
        queryFn: () => paymentService.getPayments(page, rowsPerPage),
    });

    const rows: PaymentRow[] = useMemo(() => {
        if (!paymentData?.data) return [];
        return paymentData.data.map((p: any) => {
            const billing = p.orderDetails?.billingInfo || {};
            const amountINR = (parseFloat(p.amount) || 0);
            const refundedINR = (p.refundAmount || 0) / 100;

            return {
                id: p._id,
                paymentId: p.paymentId,
                orderId: p.orderId,
                customerName: p.userDetails?.username || billing.firstName || "Customer",
                email: p.userDetails?.email || billing.email || "N/A",
                amount: amountINR,
                refundedSoFar: refundedINR,
                refundStatus: p.refundStatus || "None",
                paymentDate: new Date(p.paymentDate).toLocaleDateString("en-IN"),
                raw: p,
            };
        });
    }, [paymentData]);

    const refundMutation = useMutation({
        mutationFn: paymentService.refundPayment,
        onSuccess: () => {
            toast.success("Razorpay Institutional Refund Processed");
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            closeModals();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Refund failed");
        },
    });

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter(r =>
            r.customerName.toLowerCase().includes(q) ||
            r.paymentId.toLowerCase().includes(q) ||
            r.orderId.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const totalPages = paymentData?.totalPages || 1;

    const closeModals = () => {
        setSelectedRow(null);
        setIsRefundModalOpen(false);
    };

    const startRefund = (e: React.MouseEvent, row: PaymentRow) => {
        e.stopPropagation();
        setSelectedRow(row);
        // Default to the remaining balance for partial refunds
        const balance = row.amount - row.refundedSoFar;
        setRefundAmount(balance.toString());
        setIsRefundModalOpen(true);
    };

    const handleRefundSubmit = () => {
        if (!selectedRow) return;
        refundMutation.mutate({
            paymentId: selectedRow.id, // Internal MongoDB ID
            refund_amount: Number(refundAmount), // INR Amount
            refund_note: "Institutional refund via Admin Panel"
        });
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
            {/* Ambient glow accents */}
            <div
                className="
                    pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl
                    bg-gradient-to-br
                    from-rose-500/20 via-orange-500/20 to-transparent
                    dark:from-rose-600/30 dark:via-purple-600/30 dark:to-transparent
                "
            />
            <div
                className="
                    pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full blur-3xl
                    bg-gradient-to-tr
                    from-black/20 via-black/10 to-transparent
                    dark:from-emerald-500/25 dark:via-cyan-500/25 dark:to-transparent
                "
            />

            <div className="relative">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">Transacted Assets</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage transaction history and institutional Razorpay refunds.</p>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
                            ⌕
                        </span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Payment ID or Customer..."
                            className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm backdrop-blur-xl transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
                        />
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
                    <Table>
                        <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-semibold">Customer</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-semibold">Transaction</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-semibold">Original</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-semibold">Refunded</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-semibold">State</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center font-semibold">Action</TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-white/10 dark:divide-white/10">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <PaymentsTableSkeletonRow key={i} />)
                            ) : filtered.length > 0 ? (
                                filtered.map((row: PaymentRow) => (
                                    <TableRow
                                        key={row.id}
                                        onClick={() => setSelectedRow(row)}
                                        className="group cursor-pointer border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                                    >
                                        <TableCell className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar nameForInitials={row.customerName} size={36} />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900 dark:text-slate-50">{row.customerName}</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{row.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">#{row.paymentId}</span>
                                                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Order: {row.orderId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                            ₹{row.amount.toLocaleString("en-IN")}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 font-medium text-rose-500">
                                            {row.refundedSoFar > 0 ? `₹${row.refundedSoFar.toLocaleString("en-IN")}` : '-'}
                                        </TableCell>
                                        <TableCell className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ring-1 ring-inset ${row.refundStatus === "Full"
                                                ? "bg-rose-500/10 text-rose-500 ring-rose-500/30 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]"
                                                : row.refundStatus === "Partial"
                                                    ? "bg-amber-500/10 text-amber-500 ring-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]"
                                                    : "bg-emerald-500/10 text-emerald-500 ring-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                                                }`}>
                                                {row.refundStatus === "None" ? "Success" : row.refundStatus}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-center">
                                            <button
                                                onClick={(e) => {
                                                    if (canAction) {
                                                        startRefund(e, row);
                                                    }
                                                }}
                                                disabled={row.refundStatus === "Full" || !canAction}
                                                title={!canAction ? "You are not allowed to process refunds" : ""}
                                                className={`rounded-lg px-4 py-1.5 text-[11px] font-bold text-white shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${canAction && row.refundStatus !== "Full"
                                                    ? "bg-rose-500 hover:brightness-110 shadow-[0_10px_25px_rgba(248,113,113,0.5)]"
                                                    : "bg-slate-400 cursor-not-allowed opacity-60"
                                                    }`}
                                            >
                                                {row.refundStatus === "Full" ? "Settled" : canAction ? "Refund" : "Not Allowed"}
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="border-0">
                                    <TableCell colSpan={6} className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

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

                {/* Refund Modal */}
                <ModalWrapper isOpen={isRefundModalOpen} onClose={closeModals}>
                    {selectedRow && (
                        <div className="space-y-4 p-2">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-rose-500/20 p-2"><RotateCcw size={20} className="text-rose-600" /></div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Razorpay Refund</h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Initiate an institutional refund for <strong>#{selectedRow.paymentId}</strong>.</p>

                            <div className="space-y-1.5 border-t border-b border-white/10 py-3 my-2 dark:border-white/5">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>Paid Amount</span><span>₹{selectedRow.amount}</span></div>
                                <div className="flex justify-between text-xs text-rose-500"><span>Already Refunded</span><span>-₹{selectedRow.refundedSoFar}</span></div>
                                <div className="flex justify-between text-sm font-bold pt-1 border-t border-white/10 mt-1 dark:text-slate-200 dark:border-white/5"><span>Maximum Refundable</span><span>₹{selectedRow.amount - selectedRow.refundedSoFar}</span></div>
                            </div>

                            <div className="space-y-1.5 focus-within:ring-2 focus-within:ring-rose-500/20 rounded-xl transition-all">
                                <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">Refund Amount (₹)</label>
                                <input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    className="w-full rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-sm font-bold text-slate-900 outline-none backdrop-blur-xl focus:border-rose-500/50 dark:bg-slate-900/50 dark:text-slate-100 dark:border-white/10"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={closeModals} className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Cancel</button>
                                <button
                                    onClick={handleRefundSubmit}
                                    disabled={refundMutation.isPending}
                                    className="rounded-xl bg-gradient-to-r from-rose-600 to-red-500 px-6 py-2.5 text-xs font-bold text-white shadow-[0_12px_25px_rgba(225,29,72,0.4)] active:scale-95 transition-all hover:brightness-110"
                                >
                                    {refundMutation.isPending ? "Connecting..." : "Confirm Refund"}
                                </button>
                            </div>
                        </div>
                    )}
                </ModalWrapper>
            </div>
        </div>
    );
}
