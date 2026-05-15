// src/pages/Tables/InvoiceDetail.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { invoiceService } from "../../services/invoiceService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { pdf } from "@react-pdf/renderer";
import { InvoicePdf } from "../../layout/InvoicePdf"; 

type InvoiceItem = {
  productId?: {
    _id: string;
    productName: string;
    rentalPrice?: number;
    deposit?: number;
  };
  // ✅ Added packageId support
  packageId?: {
    _id: string;
    packageName: string;
    monthlyPrice?: number;
    depositAmount?: number;
  };
  resolvedName?: string; // ✅ Added resolvedName from backend
  quantity: number;
  price: number;
  rentalDuration?: string;
  productName?: string; // Fallback
};

type BillingInfo = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  landmark?: string;
  town?: string;
  state?: string;
  postcode?: string;
  emiDate?: string;
};

type RecurringPayment = {
  id: string;
  createdAt: string;
  amount: number;
  status: string;
  method: string;
  razorpayPaymentId?: string;
  invoiceId?: string;
  paymentType?: string;
};

type InvoiceResponse = {
  success: boolean;
  invoice: {
    id: string;
    invoice_number: string;
    created_at: string;
    billingInfo: BillingInfo;
    items: InvoiceItem[];
    totals: {
      subtotal: number;
      cgst: number;
      igst: number;
      totalAmount: number;
      depositAmount: number;
    };
    paymentType: string;
    paymentMethod: string;
    orderId?: string;
  };
  user: {
    id: string;
    username?: string;
    email: string;
    phone?: string;
    customerId?: string;
  } | null;
  subscription: any;
  recurringPayments: RecurringPayment[];
};

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [downloading, setDownloading] = useState(false);

  const { data, isLoading: loading, isError } = useQuery<InvoiceResponse>({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.getInvoiceById(id!),
    enabled: !!id,
  });


  const handleDownloadPdf = async () => {
    if (!data || !data.invoice) return;
    try {
      setDownloading(true);

      const doc = (
        <InvoicePdf
          invoice={data.invoice}
          user={data.user}
          subscription={data.subscription}
          recurringPayments={data.recurringPayments}
          logoUrl="/images/logo/rentbuddy.png"
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.invoice.invoice_number || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Invoice" />
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
      </div>
    );
  }

  if (isError || !data || !data.success || !data.invoice) {
    return (
      <div className="p-6">
        <PageBreadcrumb pageTitle="Invoice" />
        <div className="mt-4 rounded-2xl border border-rose-300/60 bg-rose-50/80 p-6 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-100">
          Unable to load invoice. It may have been removed or an error occurred.
        </div>
      </div>
    );
  }

  const { invoice, user, recurringPayments, subscription } = data;

  const billToName =
    `${invoice.billingInfo?.firstName || ""} ${
      invoice.billingInfo?.lastName || ""
    }`.trim() || user?.username || user?.email;

  const billToLines = [
    invoice.billingInfo?.address,
    invoice.billingInfo?.landmark,
    invoice.billingInfo?.town,
    invoice.billingInfo?.state,
    invoice.billingInfo?.postcode,
  ].filter(Boolean);

  const createdDate = invoice.created_at
    ? new Date(invoice.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const startDate =
    subscription?.startAt &&
    new Date(subscription.startAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const hasRecurring = recurringPayments && recurringPayments.length > 0;

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle="Invoice Detail" />

      {/* Back + Download buttons */}
      <div className="mt-3 mb-2 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/invoice")}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white hover:-translate-y-[1px] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <span>←</span>
          <span>Back to Invoices</span>
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-500 via-[#f03e47] to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(239,68,68,0.55)] transition hover:brightness-110 hover:-translate-y-[1px] disabled:opacity-60"
        >
          <span>⬇</span>
          <span>{downloading ? "Generating..." : "Download PDF"}</span>
        </button>
      </div>

      {/* INVOICE CARD */}
      <div className="mt-2 relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
        <div className="relative space-y-6">
          {/* Header: Logo + Company + Invoice meta */}
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
            {/* Logo + Company */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-xl text-black px-4 py-2 text-sm font-semibold shadow-md dark:text-slate-300">
                <span className="inline-flex h-17 w-17 items-center justify-center dark:bg-white rounded-lg text-xs font-bold">
                  <img
                    src="/images/logo/rentbuddy.png"
                    alt="Rentbuddy Logo"
                    className="h-12 w-12 object-contain"
                  />
                </span>
                <span>RENTBUDDY FURNISHING SOLUTIONS PVT. LTD.</span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                <p>Anurag Nagar 64 A Indore</p>
                <p>Indore 452011, Madhya Pradesh, India</p>
                <p>Phone: 9039383900</p>
                <p>Email: rentbuddyrb@gmail.com</p>
                <p>GSTIN: 23AALCR9879E1ZT</p>
              </div>
            </div>

            {/* Invoice meta */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Invoice
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {invoice.invoice_number}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <span className="text-slate-500">Order #</span>
                <span className="font-medium text-right">
                  {invoice.orderId || "-"}
                </span>

                <span className="text-slate-500">Order Date</span>
                <span className="text-right">{createdDate || "-"}</span>

                <span className="text-slate-500">Start Date</span>
                <span className="text-right">{startDate || "-"}</span>

                <span className="text-slate-500">Plan</span>
                <span className="text-right">
                  {invoice.paymentType === "Recurring Payment"
                    ? "Recurring Rental Plan"
                    : "One-time Rental"}
                </span>

                <span className="text-slate-500">Payment Method</span>
                <span className="text-right">{invoice.paymentMethod || "-"}</span>
              </div>
            </div>
          </div>

          {/* Bill To + Customer */}
          <div className="grid gap-6 rounded-2xl border border-white/20 bg-white/60 p-4 text-xs shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex flex-col gap-3 md:flex-row md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Bill To
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {billToName}
                </p>
                <div className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                  {billToLines.map((l, idx) => (
                    <p key={idx}>{l}</p>
                  ))}
                  {user?.customerId && <p>Customer ID: {user.customerId}</p>}
                  {user?.phone && <p>Phone: {user.phone}</p>}
                  {user?.email && <p>Email: {user.email}</p>}
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-medium">Payment Type: </span>
                  {invoice.paymentType}
                </p>
                {invoice.billingInfo?.emiDate && (
                  <p>
                    <span className="font-medium">EMI Date: </span>
                    {invoice.billingInfo.emiDate}
                  </p>
                )}
                {subscription && (
                  <p>
                    <span className="font-medium">Subscription Status: </span>
                    {subscription.status}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-2xl border border-white/20 bg-white/70 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
            <div className="border-b border-[#f03e47]/30 bg-gradient-to-r from-[#f03e47] via-[#ff5c60] to-[#f98b63] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-xl dark:border-[#f03e47]/50 dark:from-[#b32130] dark:via-[#cd3844] dark:to-[#f5665d] rounded-t-2xl">
              Rental Items
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="border-b border-[#f03e47]/30 bg-[#f03e47] text-[11px] uppercase tracking-[0.16em] text-white dark:border-[#f03e47]/60 dark:bg-[#b32130]">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      Description
                    </th>
                    <th className="px-4 py-2 text-center">Quantity</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Taxes</th>
                    <th className="px-4 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 dark:divide-white/10">
                  {invoice.items.map((item: InvoiceItem, idx: number) => {
                    // ✅ Updated name resolution logic to handle Package vs Product
                    const name =
                      item.resolvedName || 
                      item.packageId?.packageName || 
                      item.productId?.productName || 
                      item.productName || 
                      `Item ${idx + 1}`;

                    const qty = item.quantity || 1;
                    const unitPrice = item.price || 0;
                    const lineAmount = qty * unitPrice;

                    return (
                      <tr
                        key={idx}
                        className="hover:bg-white/70 dark:hover:bg-slate-900/70"
                      >
                        <td className="px-4 py-3 align-top text-left text-slate-800 dark:text-slate-100">
                          <div className="font-medium">{name}</div>
                          {item.rentalDuration && (
                            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              Rental Duration: {item.rentalDuration}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-200">
                          {qty}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
                          ₹{unitPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                          Included
                        </td>
                        <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-100">
                          ₹{lineAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-3 border-t border-white/20 px-4 py-3 text-xs md:flex-row md:justify-end dark:border-white/10">
              <div className="w-full max-w-xs ml-auto space-y-1 text-slate-700 dark:text-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ₹{invoice.totals.subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>₹{invoice.totals.cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGST</span>
                  <span>₹{invoice.totals.igst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit</span>
                  <span>
                    ₹{invoice.totals.depositAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-1 flex justify-between border-t border-dashed border-slate-300 pt-2 text-sm font-semibold dark:border-slate-600">
                  <span>Total</span>
                  <span>
                    ₹{invoice.totals.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Payment History table */}
          {hasRecurring && (
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50/80 p-4 text-xs shadow-sm backdrop-blur-xl dark:border-emerald-500/40 dark:bg-emerald-950/40">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                  Recurring Payment History
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-emerald-200/60 bg-white/80 dark:border-emerald-500/30 dark:bg-slate-950/70">
                <table className="min-w-full text-xs">
                  <thead className="border-b border-emerald-100 bg-emerald-50/80 text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/70 dark:text-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Payment Date</th>
                      <th className="px-3 py-2 text-center">Month</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-center">Status</th>
                      <th className="px-3 py-2 text-left">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 dark:divide-emerald-500/20">
                    {recurringPayments.map((p: RecurringPayment, idx: number) => {
                      const d = p.createdAt ? new Date(p.createdAt) : null;
                      const dateLabel = d
                        ? d.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-";
                      const monthLabel = d
                        ? d.toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })
                        : "-";

                      const isSuccess =
                        (p.status || "").toLowerCase() === "success";

                      return (
                        <tr key={p.id || idx}>
                          <td className="px-3 py-2 text-left text-slate-800 dark:text-slate-100">
                            {dateLabel}
                          </td>
                          <td className="px-3 py-2 text-center text-slate-700 dark:text-slate-200">
                            {monthLabel}
                          </td>
                          <td className="px-3 py-2 text-right text-slate-800 dark:text-slate-100">
                            ₹{p.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                                isSuccess
                                  ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/40"
                                  : "bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/40"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isSuccess ? "bg-emerald-400" : "bg-rose-400"
                                }`}
                              />
                              {p.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-left text-slate-700 dark:text-slate-200">
                            {p.method}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-[11px] text-emerald-700/80 dark:text-emerald-100/80">
                Each successful payment extends the subscription as per the
                mandate. Missed payments may move the subscription to{" "}
                <span className="font-semibold">past_due</span> status with a
                grace period, as defined in your subscription logic.
              </p>
            </div>
          )}

          {/* Terms */}
          <div className="rounded-2xl border border-white/20 bg-white/70 p-4 text-[10px] leading-relaxed text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-300">
            <p className="mb-1 font-semibold text-slate-700 dark:text-slate-100">
              Terms & Conditions
            </p>
            <ol className="space-y-0.5 list-decimal pl-4">
              <li>
                This invoice covers furniture and appliance rental services for
                the items listed. All items remain the property of Rentbuddy
                Furnishing Solutions Pvt. Ltd.
              </li>
              <li>
                Monthly rental fees are due on or before the due date. Late
                payments may attract additional charges as per your policy.
              </li>
              <li>
                Deposits are refundable post inspection of all items. Deductions
                may apply for damage, loss, or missing accessories.
              </li>
              <li>
                The renter is responsible for maintaining the rented items in
                good condition and notifying Rentbuddy of any issues.
              </li>
              <li>
                This agreement is governed by the laws of Madhya Pradesh and any
                disputes fall under Indore jurisdiction.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;