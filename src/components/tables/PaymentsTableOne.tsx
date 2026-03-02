import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../../services/paymentService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import ModalWrapper from "../../layout/ModalWrapper";
import Avatar from "../ui/avatar/Avatar";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";
import PaymentsTableSkeletonRow from "../loader/PaymentsTableSkeletonRow";

type PaymentApi = any;

type PaymentRow = {
  id: string;
  paymentId?: string;
  orderId: string;
  invoiceId?: string;
  invoiceNumber?: string;
  customerName: string;
  email: string;
  phone?: string;
  amount: number;
  paymentType: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate: string;
  subscriptionStatus?: string | null;
  raw: PaymentApi;
};

const PaymentsTableOne: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // filters
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "pending" | "failed"
  >("all");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "cumulative" | "recurring"
  >("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  // dropdown open states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);

  // detail modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentApi | null>(
    null
  );

  const navigate = useNavigate();

  const statusLabelMap: Record<
    "all" | "success" | "pending" | "failed",
    string
  > = {
    all: "All Status",
    success: "Success / Completed",
    pending: "Pending",
    failed: "Failed",
  };

  const typeLabelMap: Record<"all" | "cumulative" | "recurring", string> = {
    all: "All Payment Types",
    cumulative: "Cumulative Payment",
    recurring: "Recurring Payment",
  };

  const { data: paymentData, isLoading, isError, error } = useQuery({
    queryKey: ["payments", page, limit],
    queryFn: () => paymentService.getPayments(page, limit),
  });

  const payments: PaymentRow[] = useMemo(() => {
    if (!paymentData?.data) return [];

    return paymentData.data.map((p: any) => {
      const user = p.userDetails || {};
      const order = p.orderDetails || {};
      const invoice = p.invoiceDetails || {};
      const subscription = p.subscriptionDetails || {};

      const customerName =
        user.username ||
        p.customerName ||
        (order.userId && order.userId.username) ||
        "Unknown";

      const email =
        user.email || (order.userId && order.userId.email) || "N/A";

      const phone =
        user.phone || (order.userId && order.userId.phone) || undefined;

      const amountNum = parseFloat(p.amount || "0") || 0;

      const paymentDate = p.paymentDate
        ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        : "";

      const subscriptionStatus = subscription?.status || null;

      return {
        id: p._id,
        paymentId: p.paymentId,
        orderId: p.orderId,
        invoiceId: p.invoiceId || invoice?._id,
        invoiceNumber: invoice?.invoice_number,
        customerName,
        email,
        phone,
        amount: amountNum,
        paymentType: p.paymentType || "",
        paymentStatus: p.paymentStatus || "",
        paymentMethod: p.paymentMethod || "",
        paymentDate,
        subscriptionStatus,
        raw: p,
      };
    });
  }, [paymentData]);

  const totalPages = paymentData?.totalPages || 1;

  // reset page when filters/search change (client-side filter)
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, methodFilter]);

  // payment methods for filter dropdown
  const uniqueMethods = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => {
      if (p.paymentMethod) set.add(p.paymentMethod);
    });
    return Array.from(set);
  }, [payments]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return payments.filter((p) => {
      const searchMatch =
        !query ||
        p.customerName.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.orderId.toLowerCase().includes(query) ||
        (p.paymentId || "").toLowerCase().includes(query) ||
        (p.invoiceNumber || "").toLowerCase().includes(query) ||
        (p.invoiceId || "").toLowerCase().includes(query);

      const statusNorm = (p.paymentStatus || "").toLowerCase();
      const typeNorm = (p.paymentType || "").toLowerCase();
      const methodNorm = (p.paymentMethod || "").toLowerCase();

      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "success" &&
          (statusNorm === "success" || statusNorm === "completed")) ||
        (statusFilter === "pending" && statusNorm === "pending") ||
        (statusFilter === "failed" && statusNorm === "failed");

      const typeMatch =
        typeFilter === "all" ||
        (typeFilter === "cumulative" &&
          typeNorm === "cumulative payment") ||
        (typeFilter === "recurring" &&
          typeNorm === "recurring payment");

      const methodMatch =
        methodFilter === "all" ||
        methodNorm === methodFilter.toLowerCase();

      return searchMatch && statusMatch && typeMatch && methodMatch;
    });
  }, [payments, search, statusFilter, typeFilter, methodFilter]);

  const openDetail = (p: PaymentApi) => setSelectedPayment(p);
  const closeDetail = () => setSelectedPayment(null);

  const handleViewInvoice = () => {
    if (!selectedPayment) return;
    const invoice = selectedPayment.invoiceDetails;
    const fallbackId = selectedPayment.invoiceId;

    if (invoice && invoice._id) {
      navigate(`/invoice/${invoice._id}`);
    } else if (fallbackId) {
      navigate(`/invoice/${fallbackId}`);
    }
  };

  return (
    <div className="relative">
      {/* Header + Search + Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Payments
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All customer payments across cumulative and recurring plans.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search by name, email, order, or payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className="dropdown-toggle flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
            >
              <span>{statusLabelMap[statusFilter]}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <Dropdown
              isOpen={isStatusDropdownOpen}
              onClose={() => setIsStatusDropdownOpen(false)}
              className="w-48"
            >
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("all");
                  setIsStatusDropdownOpen(false);
                }}
              >
                All Status
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("success");
                  setIsStatusDropdownOpen(false);
                }}
              >
                Success / Completed
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("pending");
                  setIsStatusDropdownOpen(false);
                }}
              >
                Pending
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("failed");
                  setIsStatusDropdownOpen(false);
                }}
              >
                Failed
              </DropdownItem>
            </Dropdown>
          </div>

          {/* Payment type filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen((prev) => !prev)}
              className="dropdown-toggle flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
            >
              <span>{typeLabelMap[typeFilter]}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <Dropdown
              isOpen={isTypeDropdownOpen}
              onClose={() => setIsTypeDropdownOpen(false)}
              className="w-56"
            >
              <DropdownItem
                onItemClick={() => {
                  setTypeFilter("all");
                  setIsTypeDropdownOpen(false);
                }}
              >
                All Payment Types
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setTypeFilter("cumulative");
                  setIsTypeDropdownOpen(false);
                }}
              >
                Cumulative Payment
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setTypeFilter("recurring");
                  setIsTypeDropdownOpen(false);
                }}
              >
                Recurring Payment
              </DropdownItem>
            </Dropdown>
          </div>

          {/* Method filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMethodDropdownOpen((prev) => !prev)}
              className="dropdown-toggle flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
            >
              <span>{methodFilter === "all" ? "All Methods" : methodFilter}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isMethodDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <Dropdown
              isOpen={isMethodDropdownOpen}
              onClose={() => setIsMethodDropdownOpen(false)}
              className="w-44"
            >
              <DropdownItem
                onItemClick={() => {
                  setMethodFilter("all");
                  setIsMethodDropdownOpen(false);
                }}
              >
                All Methods
              </DropdownItem>
              {uniqueMethods.map((m) => (
                <DropdownItem
                  key={m}
                  onItemClick={() => {
                    setMethodFilter(m);
                    setIsMethodDropdownOpen(false);
                  }}
                >
                  {m || "Unknown"}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Loading / Error states */}
      {isLoading && (
        <div className="mb-4 rounded-xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300">
          Loading payments...
        </div>
      )}

      {isError && (
        <div className="mb-4 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-100">
          {error?.message || "Failed to fetch payments"}
        </div>
      )}

      {/* Table */}
      <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
        <Table>
          <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
            <TableRow>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Payment
              </TableCell>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Customer
              </TableCell>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Email
              </TableCell>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Amount
              </TableCell>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Type
              </TableCell>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Status
              </TableCell>
              <TableCell isHeader className="px-3 py-3 font-semibold">
                Date
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-white/10 dark:divide-white/10">
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <PaymentsTableSkeletonRow key={i} />
              ))
            ) : filtered.length > 0 ? (
              filtered.map((p) => (
                <TableRow
                  key={p.id}
                  onClick={() => openDetail(p.raw)}
                  className="group cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200"
                >
                  {/* Payment ID + Order + Invoice */}
                  <TableCell className="px-4 py-4 text-sm text-slate-800 dark:text-slate-200">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs">
                        #{p.paymentId || p.id}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Order: {p.orderId}
                      </span>
                      {p.invoiceNumber && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Invoice: {p.invoiceNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell className="px-4 py-4 text-sm text-slate-900 dark:text-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar
                        alt={p.customerName}
                        nameForInitials={p.customerName}
                        size={36}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{p.customerName}</span>
                        {p.subscriptionStatus && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Subscription: {p.subscriptionStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                      {p.email}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="px-4 py-4 text-sm text-slate-800 dark:text-slate-100">
                    ₹{p.amount.toLocaleString("en-IN")}
                  </TableCell>

                  {/* Type + Method */}
                  <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                    <span className="rounded-full bg-slate-900/5 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-100/5 dark:text-slate-200">
                      {p.paymentType}
                    </span>
                    {p.paymentMethod && (
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {p.paymentMethod}
                      </div>
                    )}
                  </TableCell>

                  {/* Status pill */}
                  <TableCell className="px-4 py-4 text-sm">
                    {(() => {
                      const statusLower = p.paymentStatus.toLowerCase();
                      let cls =
                        "bg-slate-500/10 text-slate-300 ring-slate-500/40 shadow-[0_0_0_1px_rgba(148,163,184,0.35)]";
                      let dot = "bg-slate-400";

                      if (
                        statusLower === "success" ||
                        statusLower === "completed"
                      ) {
                        cls =
                          "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]";
                        dot = "bg-emerald-400";
                      } else if (statusLower === "pending") {
                        cls =
                          "bg-amber-500/10 text-amber-400 ring-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]";
                        dot = "bg-amber-400";
                      } else if (statusLower === "failed") {
                        cls =
                          "bg-rose-500/10 text-rose-400 ring-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]";
                        dot = "bg-rose-400";
                      }

                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${cls}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${dot}`}
                          />
                          {p.paymentStatus || "Unknown"}
                        </span>
                      );
                    })()}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {p.paymentDate}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                >
                  {isLoading
                    ? "Loading payments..."
                    : "No payments found. Try adjusting your search or filters."}
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
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

      {/* Detail modal */}
      <ModalWrapper isOpen={!!selectedPayment} onClose={closeDetail}>
        {selectedPayment && (
          <div className="max-w-xl space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Payment Detail
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  #{selectedPayment.paymentId || selectedPayment._id}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Order: {selectedPayment.orderId}
                  {selectedPayment.invoiceDetails?.invoice_number && (
                    <>
                      {" "}
                      · Invoice:{" "}
                      {selectedPayment.invoiceDetails.invoice_number}
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Type pill */}
                <span className="rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-100/5 dark:text-slate-200">
                  {selectedPayment.paymentType}
                </span>

                {/* Status pill */}
                {(() => {
                  const statusLower =
                    (selectedPayment.paymentStatus || "").toLowerCase();
                  let cls = "bg-slate-500/10 text-slate-300 ring-slate-500/40";
                  let dot = "bg-slate-400";

                  if (
                    statusLower === "success" ||
                    statusLower === "completed"
                  ) {
                    cls =
                      "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40";
                    dot = "bg-emerald-400";
                  } else if (statusLower === "pending") {
                    cls = "bg-amber-500/10 text-amber-400 ring-amber-500/40";
                    dot = "bg-amber-400";
                  } else if (statusLower === "failed") {
                    cls = "bg-rose-500/10 text-rose-400 ring-rose-500/40";
                    dot = "bg-rose-400";
                  }

                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${cls}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${dot}`}
                      />
                      {selectedPayment.paymentStatus}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Amount & method */}
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/70 p-3 text-xs shadow-sm dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Amount
                </span>
                <span className="text-base font-semibold text-slate-900 dark:text-slate-50">
                  ₹
                  {parseFloat(selectedPayment.amount || "0").toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Method
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedPayment.paymentMethod || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Date
                </span>
                <span className="text-slate-800 dark:text-slate-200">
                  {selectedPayment.paymentDate
                    ? new Date(
                      selectedPayment.paymentDate
                    ).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "-"}
                </span>
              </div>
              {selectedPayment.transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Transaction ID
                  </span>
                  <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {selectedPayment.transactionId}
                  </span>
                </div>
              )}
            </div>

            {/* Customer */}
            {selectedPayment.userDetails && (
              <div className="grid gap-3 rounded-xl border border-white/10 bg-white/70 p-3 text-xs shadow-sm dark:border-white/10 dark:bg-slate-950/60">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Customer
                </p>
                <div className="flex items-center gap-3">
                  <Avatar
                    alt={selectedPayment.userDetails.username}
                    nameForInitials={selectedPayment.userDetails.username}
                    size={32}
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {selectedPayment.userDetails.username}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedPayment.userDetails.email}
                    </p>
                    {selectedPayment.userDetails.phone && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedPayment.userDetails.phone}
                      </p>
                    )}
                    {selectedPayment.userDetails.customerId && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Customer ID: {selectedPayment.userDetails.customerId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Subscription / Recurring info */}
            {selectedPayment.subscriptionDetails && (
              <div className="grid gap-2 rounded-xl border border-emerald-300/40 bg-emerald-50/80 p-3 text-xs shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/40">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
                  Subscription
                </p>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-medium">
                    {selectedPayment.subscriptionDetails.status}
                  </span>
                </div>
                {selectedPayment.subscriptionDetails.subscriptionId && (
                  <div className="flex items-center justify-between">
                    <span>Subscription ID</span>
                    <span className="font-mono text-[11px]">
                      {selectedPayment.subscriptionDetails.subscriptionId}
                    </span>
                  </div>
                )}
                {selectedPayment.subscriptionDetails.planAmount && (
                  <div className="flex items-center justify-between">
                    <span>Plan Amount</span>
                    <span>
                      ₹
                      {Number(selectedPayment.subscriptionDetails.planAmount) / 100}
                    </span>
                  </div>
                )}

                {/* Billing month for recurring payment */}
                {selectedPayment.paymentType === "Recurring Payment" &&
                  selectedPayment.forMonth && (
                    <div className="flex items-center justify-between">
                      <span>Billing Month</span>
                      <span>
                        {new Date(
                          selectedPayment.forMonth
                        ).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                {selectedPayment.subscriptionDetails.nextChargeAt && (
                  <div className="flex items-center justify-between">
                    <span>Next Charge</span>
                    <span>
                      {new Date(
                        selectedPayment.subscriptionDetails.nextChargeAt
                      ).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={closeDetail}
                className="rounded-lg border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white/90 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Close
              </button>

              {(selectedPayment.invoiceDetails || selectedPayment.invoiceId) && (
                <button
                  onClick={handleViewInvoice}
                  className="rounded-lg bg-gradient-to-r from-rose-500 via-[#f03e47] to-orange-500 px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(248,113,113,0.55)] transition hover:brightness-110"
                >
                  View Invoice
                </button>
              )}
            </div>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

export default PaymentsTableOne;
