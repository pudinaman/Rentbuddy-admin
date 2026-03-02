import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import ModalWrapper from "../../layout/ModalWrapper";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface OrderTableProps {
  allowedRoles?: string[];
}

export default function OrderTableOne({ allowedRoles }: OrderTableProps) {
  const queryClient = useQueryClient();

  const userRaw = localStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const userRole = currentUser?.role?.toLowerCase();
  const canAction = allowedRoles?.includes("admin") && userRole === "admin";

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    city: "",
    state: "",
    status: "all"
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        search,
        city: cityFilter,
        state: stateFilter,
        status: statusFilter
      });
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, cityFilter, stateFilter, statusFilter]);

  // delete confirm modal state
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ["orders", currentPage, debouncedFilters],
    queryFn: () => orderService.getOrders({
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedFilters.search,
      state: debouncedFilters.state,
      city: debouncedFilters.city,
      status: debouncedFilters.status === "all" ? "" : debouncedFilters.status,
    }),
  });

  const statusLabelMap: Record<string, string> = {
    all: "All Status",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const orders = orderData?.data || [];
  const pagination = orderData?.pagination || { totalPages: 1, total: 0 };
  const totalPages = pagination.totalPages;

  const processedOrders = orders.map((order: any) => {
    const cities = Array.from(
      new Set(
        order.items
          ?.map(
            (item: any) =>
              item.productId?.city || item.product?.city
          )
          .filter(Boolean)
      )
    ) as string[];

    return {
      id: order._id,              // ✅ Mongo ObjectId
      orderId: order.orderId,     // ✅ Business Order ID
      customerName: order.userId?.username || "Unknown",
      email: order.userId?.email || "N/A",
      phone: order.billingInfo?.phone || "N/A",
      amount: order.totalAmount,
      status: order.status || "Pending",
      paymentType: order.paymentType || "N/A",
      cities,
      createdDate: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  });

  const deleteOrderMutation = useMutation({
    mutationFn: orderService.deleteOrder,
    onSuccess: () => {
      toast.success("Order deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      closeConfirm();
    },
    onError: (err: any) => {
      console.error("Delete failed:", err);
      toast.error("Failed to delete order");
    },
  });

  // reset page when dates change

  // modal helpers
  const openConfirm = (id: string) => {
    setConfirmId(id);
  };

  const closeConfirm = () => {
    if (deleteOrderMutation.isPending) return;
    setConfirmId(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmId) return;
    deleteOrderMutation.mutate(confirmId);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents */}
      {/* TOP LEFT BLOB */}
      <div
        className="
    pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl
    bg-gradient-to-br
    from-[#F24E6C]/25 via-[#FF6F8C]/20 to-transparent
    dark:from-blue-600/30 dark:via-purple-600/30 dark:to-transparent
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
        {/* Header with Search + Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Orders
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track all orders, filter by status and payment type.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-50">
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search order ID, name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>

            {/* City Filter */}
            <input
              type="text"
              placeholder="City..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full sm:w-32 rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition focus:border-blue-500/70 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
            />

            {/* State Filter */}
            <input
              type="text"
              placeholder="State..."
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full sm:w-32 rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition focus:border-blue-500/70 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
            />

            {/* Status Filter */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                className="dropdown-toggle flex w-full items-center justify-between gap-2 rounded-xl border border-white/30 bg-white/40 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/60 focus:border-blue-500/70 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-900/80 sm:w-40"
              >
                <span className="truncate">
                  {statusLabelMap[statusFilter.toLowerCase()] || statusFilter}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <Dropdown
                isOpen={isStatusDropdownOpen}
                onClose={() => setIsStatusDropdownOpen(false)}
                className="w-full sm:w-48"
              >
                {Object.entries(statusLabelMap).map(([key, label]) => (
                  <DropdownItem
                    key={key}
                    onItemClick={() => {
                      setStatusFilter(key);
                      setIsStatusDropdownOpen(false);
                    }}
                  >
                    {label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Date Filters */}
            {/* <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-white/30 bg-white/40 px-2 py-1.5 text-[10px] text-slate-900 outline-none dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-white/30 bg-white/40 px-2 py-1.5 text-[10px] text-slate-900 outline-none dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div> */}
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold">Order ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">Customer</TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">Amount</TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">Location (City)</TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">Payment Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">Date</TableCell>
                <TableCell isHeader className="px-5 py-3 text-center font-semibold">Action</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm italic text-slate-500 dark:text-slate-400">
                    Syncing with server...
                  </TableCell>
                </TableRow>
              ) : processedOrders.length > 0 ? (
                processedOrders.map((order: any) => (
                  <TableRow
                    key={order.id}
                    className="group border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                  >
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] font-mono tracking-tight dark:bg-slate-100/5">
                        {order.orderId}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{order.customerName}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{order.phone}</span>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">₹{order.amount}</TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {order.cities.map((city: string) => (
                          <span key={city} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            {city}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset ${order.status.toLowerCase() === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                          : order.status.toLowerCase() === "cancelled"
                            ? "bg-rose-500/10 text-rose-400 ring-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]"
                            : order.status.toLowerCase() === "processing"
                              ? "bg-blue-500/10 text-blue-400 ring-blue-500/40 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                              : "bg-amber-500/10 text-amber-400 ring-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]"
                        }`}>
                        {order.status}
                      </span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-slate-100/50 px-2 py-1 text-[11px] dark:bg-slate-800/50">{order.paymentType}</span>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-[11px] text-slate-500 dark:text-slate-400">{order.createdDate}</TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <button
                        onClick={() => { if (canAction) openConfirm(order.id); }}
                        disabled={!canAction}
                        title={!canAction ? "Not Allowed" : "Delete Order"}
                        className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-95 ${canAction
                          ? "border-rose-500/50 bg-rose-500 hover:bg-rose-600 shadow-[0_8px_20px_rgba(244,63,94,0.4)]"
                          : "border-slate-300 bg-slate-400 cursor-not-allowed opacity-50"
                          }`}
                      >
                        {canAction ? "Delete" : "Restricted"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <TableCell colSpan={8} className="py-12 text-center text-sm italic text-slate-500 dark:text-slate-400">
                    No results found for your query.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {orderData && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {currentPage}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                of {totalPages} pages
              </span>
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              windowSize={3}
            />
          </div>
        )}

        {/* Delete confirm modal */}
        <ModalWrapper isOpen={!!confirmId} onClose={closeConfirm}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Delete order?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This action cannot be undone. Are you sure you want to permanently
            delete this order?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={closeConfirm}
              disabled={deleteOrderMutation.isPending}
              className="rounded-lg border border-slate-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              No, keep
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleteOrderMutation.isPending}
              className="rounded-lg bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(248,113,113,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deleteOrderMutation.isPending ? "Deleting..." : "Yes, delete"}
            </button>
          </div>
        </ModalWrapper>

      </div>
    </div>
  );
}
