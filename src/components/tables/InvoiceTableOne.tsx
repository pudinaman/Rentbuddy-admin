import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "../../services/invoiceService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import Avatar from "../ui/avatar/Avatar";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import InvoiceTableSkeletonRow from "../loader/InvoiceTableSkeletonRow";

type InvoiceRow = {
  id: string;
  name: string;
  img?: string | null;
  customerId: string | null;
  invoiceNumber: string;
  orderId: string;
  createdDate: string;
  email: string;
  phonenumber: string;
  totalAmount: number;
  depositAmount: number;
  paymentMethod: string;
  paymentType: string;
  subscription: string; // "Active" | "Inactive"
};

export default function InvoiceTableOne() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "cumulative" | "recurring"
  >("all");
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);

  const paymentLabelMap: Record<"all" | "cumulative" | "recurring", string> = {
    all: "All Payments",
    cumulative: "Cumulative Payment",
    recurring: "Recurring Payment",
  };

  const navigate = useNavigate();

  const { data: invoiceData, isLoading, isError, error } = useQuery({
    queryKey: ["invoices", page, limit],
    queryFn: () => invoiceService.getInvoices(page, limit),
  });

  const invoices: InvoiceRow[] = useMemo(() => {
    if (!invoiceData?.invoices) return [];

    return invoiceData.invoices.map((inv: any) => {
      const firstName = inv.billingInfo?.firstName ?? "";
      const lastName = inv.billingInfo?.lastName ?? "";

      const name =
        `${firstName} ${lastName}`.trim() ||
        inv.user?.username ||
        inv.user?.email ||
        "Unknown";

      const createdDate = inv.created_at
        ? new Date(inv.created_at).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        : "";

      const subscriptionStatus = inv.subscriptionDate ? "Active" : "Inactive";

      return {
        id: inv.id,
        name,
        img: null,
        email: inv.userEmail ?? inv.user?.email ?? "-",
        phonenumber: inv.billingInfo?.phone ?? inv.user?.phone ?? "-",
        customerId: inv.user?.customerId ?? null,
        invoiceNumber: inv.invoice_number ?? "-",
        orderId: inv.orderId ?? "-",
        createdDate,
        totalAmount: inv.totalAmount ?? 0,
        depositAmount: inv.depositAmount ?? 0,
        paymentMethod: inv.paymentMethod ?? "-",
        paymentType: inv.paymentType ?? "-",
        subscription: subscriptionStatus,
      };
    });
  }, [invoiceData]);

  const totalPages = invoiceData?.totalPages || 1;

  // reset page when search/payment filter changes
  useEffect(() => {
    setPage(1);
  }, [search, paymentFilter]);

  // Search + payment filter on current page results
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return invoices.filter((inv) => {
      const matchesSearch =
        !query ||
        inv.name.toLowerCase().includes(query) ||
        inv.email.toLowerCase().includes(query) ||
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.orderId.toLowerCase().includes(query) ||
        (inv.customerId ?? "").toLowerCase().includes(query);

      const payment = inv.paymentType?.toLowerCase();

      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "cumulative" && payment === "cumulative payment") ||
        (paymentFilter === "recurring" && payment === "recurring payment");

      return matchesSearch && matchesPayment;
    });
  }, [invoices, search, paymentFilter]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents (same UI) */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative">
        {/* Header + Search + Payment filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Invoices
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View and manage customer invoices, payments, and subscription
              status.
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
                placeholder="Search by name, email, invoice, or order..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Payment type filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPaymentDropdownOpen((prev) => !prev)}
                className="dropdown-toggle flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
              >
                <span>{paymentLabelMap[paymentFilter]}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isPaymentDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <Dropdown
                isOpen={isPaymentDropdownOpen}
                onClose={() => setIsPaymentDropdownOpen(false)}
                className="w-52"
              >
                <DropdownItem
                  onItemClick={() => {
                    setPaymentFilter("all");
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  All Payments
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setPaymentFilter("cumulative");
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  Cumulative Payment
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setPaymentFilter("recurring");
                    setIsPaymentDropdownOpen(false);
                  }}
                >
                  Recurring Payment
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="mb-4 rounded-xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300">
            Loading invoices...
          </div>
        )}

        {isError && (
          <div className="mb-4 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-100">
            {error?.message || "Failed to fetch invoices"}
          </div>
        )}

        {/* Table */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Customer / Invoice
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Date
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Email
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Payment
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-semibold">
                  Subscription
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {isLoading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <InvoiceTableSkeletonRow key={i} />
                ))
              ) : filtered.length > 0 ? (
                filtered.map((inv) => (
                  <TableRow
                    key={inv.id}
                    onClick={() => navigate(`/invoice/${inv.id}`)}
                    className="group cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200"
                  >
                    {/* Customer + invoice number */}
                    <TableCell className="px-4 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar
                            src={inv.img || undefined}
                            alt={inv.name}
                            nameForInitials={inv.name}
                            size={40}
                          />
                          {inv.subscription === "Active" ? (
                            <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(248,250,252,0.9)] dark:shadow-[0_0_0_3px_rgba(15,23,42,1)]" />
                          ) : (
                            <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_0_3px_rgba(248,250,252,0.9)] dark:shadow-[0_0_0_3px_rgba(15,23,42,1)]" />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            {inv.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            #{inv.invoiceNumber} · Order {inv.orderId}
                          </span>
                          {inv.customerId && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">
                              Customer ID: {inv.customerId}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {inv.createdDate}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                        {inv.email}
                      </span>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {inv.phonenumber || "-"}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          ₹{inv.totalAmount?.toLocaleString("en-IN")}
                        </span>
                        {inv.depositAmount ? (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Deposit: ₹
                            {inv.depositAmount?.toLocaleString("en-IN")}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Payment */}
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200">
                          {inv.paymentMethod || "-"}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {inv.paymentType || ""}
                        </span>
                      </div>
                    </TableCell>

                    {/* Subscription pill */}
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${inv.subscription === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                          : "bg-rose-500/10 text-rose-400 ring-rose-500/40 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${inv.subscription === "Active"
                            ? "bg-emerald-400"
                            : "bg-rose-400"
                            }`}
                        />
                        {inv.subscription}
                      </span>
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
                      ? "Loading invoices..."
                      : "No invoices found. Try adjusting your search or filters."}
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination (same vibe as RentalStockPage) */}
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
      </div>
    </div>
  );
}
