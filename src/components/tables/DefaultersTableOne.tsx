import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../../services/paymentService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import Avatar from "../ui/avatar/Avatar";
import ModalWrapper from "../../layout/ModalWrapper";
import { toast } from "react-toastify";

type DefaulterRow = {
  subscriptionId: string;
  customerName: string;
  email: string;
  phone?: string;
  orderId?: string;
  planAmount: number;
  status: string;
  cycleStatus: string;
  nextChargeAt?: string;
  graceUntil?: string;
  lastPaymentAt?: string | null;
  missedPayments: number;
};

interface DefaultersTableProps {
  allowedRoles?: string[];
}

export default function DefaultersTableOne({ allowedRoles }: DefaultersTableProps) {
  const queryClient = useQueryClient();

  const userRaw = localStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const userRole = currentUser?.role?.toLowerCase();
  const canAction = allowedRoles?.includes("admin") && userRole === "admin";

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<DefaulterRow | null>(null);

  const rowsPerPage = 10;

  // ================= QUERIES =================
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["recurringPayments"],
    queryFn: paymentService.getRecurringPayments,
    select: (data) => {
      return (data?.data ?? [])
        .filter((item: any) => item.cycleStatus === "overdue")
        .map((item: any) => {
          const user = item.user || {};
          const order = item.order || {};

          return {
            subscriptionId: item.subscriptionId,
            customerName:
              user.username || user.name || order.customerName || "Customer",
            email: user.email || order.email || "N/A",
            phone: user.phone || order.phone || "",
            orderId: order.orderId,
            planAmount: Number(item.planAmount || 0) / 100,
            status: item.status || "overdue",
            cycleStatus: item.cycleStatus,
            nextChargeAt: item.nextChargeAt,
            graceUntil: item.graceUntil,
            lastPaymentAt: item.lastPaymentAt,
            missedPayments: item.missedPayments || 0,
          };
        });
    },
  });

  // ================= MUTATIONS =================
  const skipMonthMutation = useMutation({
    mutationFn: paymentService.skipMonth,
    onSuccess: () => {
      toast.success("Marked as paid (month skipped)");
      queryClient.invalidateQueries({ queryKey: ["recurringPayments"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to skip month");
    },
  });

  const sendStrictNoticeMutation = useMutation({
    mutationFn: paymentService.sendStrictNotice,
    onSuccess: () => {
      toast.success("Strict notice sent");
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send notice");
    },
  });

  // ================= FILTER =================
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (r: DefaulterRow) =>
        r.customerName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.subscriptionId.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  // ================= ACTIONS =================
  const openModal = (row: DefaulterRow) => {
    setSelectedRow(row);
  };

  const closeModal = () => {
    if (skipMonthMutation.isPending || sendStrictNoticeMutation.isPending) return;
    setSelectedRow(null);
  };

  const markPaid = () => {
    if (!selectedRow) return;
    skipMonthMutation.mutate(selectedRow.subscriptionId);
  };

  const sendStrictNotice = () => {
    if (!selectedRow) return;
    sendStrictNoticeMutation.mutate(selectedRow.subscriptionId);
  };

  // ================= UI =================
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-rose-400/15 via-orange-400/15 to-transparent blur-3xl" />

      <div className="relative">
        {/* HEADER */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Recurring Defaulters
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customers who missed recurring subscription payments after grace
              period.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400">
              ⌕
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or subscription..."
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm backdrop-blur-xl focus:ring-2 focus:ring-rose-500/40 dark:bg-slate-900/50 dark:text-slate-100"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80">
              <TableRow>
                <TableCell isHeader className="px-4 py-3">
                  Customer
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Subscription
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Missed
                </TableCell>
                <TableCell isHeader className="px-4 py-3">
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-center"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
                  >
                    Loading defaulters...
                  </TableCell>
                </TableRow>
              ) : current.length > 0 ? (
                current.map((row: DefaulterRow) => (
                  <TableRow
                    key={row.subscriptionId}
                    className="group border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:hover:bg-slate-900/80 transition-all"
                  >
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          nameForInitials={row.customerName}
                          size={40}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {row.customerName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {row.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 font-mono text-xs">
                      {row.subscriptionId}
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      ₹{row.planAmount.toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      {row.missedPayments}
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-400 ring-1 ring-rose-500/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        Overdue
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <button
                        onClick={() => canAction && openModal(row)}
                        disabled={!canAction}
                        title={!canAction ? "Only Admin can take action" : "Take action on this subscription"}
                        className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white shadow transition-all ${canAction
                          ? "bg-green-500 hover:brightness-110"
                          : "bg-slate-400 cursor-not-allowed opacity-60"
                          }`}
                      >
                        {canAction ? "Take Action" : "Not Allowed"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm italic text-slate-500"
                  >
                    No defaulters found.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div className="mt-5 flex justify-between items-center rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs backdrop-blur-xl">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              windowSize={3}
            />
          </div>
        )}

        {/* MODAL */}
        <ModalWrapper isOpen={!!selectedRow} onClose={closeModal}>
          {selectedRow && (
            <>
              <h3 className="text-lg font-semibold mb-3">
                Subscription Actions
              </h3>

              <p className="text-sm text-slate-500 mb-5">
                Subscription ID:{" "}
                <span className="font-mono">
                  {selectedRow.subscriptionId}
                </span>
              </p>

              <div className="flex justify-end gap-3">
                {canAction ? (
                  <>
                    <button
                      onClick={markPaid}
                      disabled={skipMonthMutation.isPending}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      {skipMonthMutation.isPending ? "Processing..." : "Mark Paid (Skip Month)"}
                    </button>

                    <button
                      onClick={sendStrictNotice}
                      disabled={sendStrictNoticeMutation.isPending}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                    >
                      {sendStrictNoticeMutation.isPending ? "Sending..." : "Send Strict Notice"}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-rose-500 italic">
                    Administrative privileges required to perform these actions.
                  </p>
                )}
              </div>
            </>
          )}
        </ModalWrapper>
      </div>
    </div>
  );
}
