// src/pdf/InvoicePdf.tsx
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image, // 👈 added for logo
} from "@react-pdf/renderer";

type InvoiceItem = {
  productId?: {
    _id: string;
    productName: string;
    rentalPrice?: number;
    deposit?: number;
  };
  quantity: number;
  price: number;
  rentalDuration?: string;
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
};

type InvoiceTotals = {
  subtotal: number;
  cgst: number;
  igst: number;
  totalAmount: number;
  depositAmount: number;
};

type InvoicePdfProps = {
  invoice: {
    id: string;
    invoice_number: string;
    created_at: string;
    billingInfo: BillingInfo;
    items: InvoiceItem[];
    totals: InvoiceTotals;
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
  /** Optional Rentbuddy logo URL (e.g. "/rentbuddy-logo.png") */
  logoUrl?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  companyBlock: {
    maxWidth: "60%",
  },

  // 👇 logo styles
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  logoFallback: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#111827",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 11, // roughly center "RB"
    marginRight: 8,
  },

  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyText: {
    marginBottom: 2,
  },
  invoiceMeta: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#6b7280",
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 180,
  },
  metaKey: {
    color: "#6b7280",
  },
  metaValue: {
    fontWeight: "bold",
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#6b7280",
    marginBottom: 4,
  },
  card: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  billToRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billToName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  table: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#f97373", // close to #f03e47
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f03e47",
    color: "#ffffff",
    paddingVertical: 4,
  },
  th: {
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: "bold",
  },
  thDescription: {
    flex: 3,
  },
  thQty: {
    flex: 1,
    textAlign: "center",
  },
  thPrice: {
    flex: 1.3,
    textAlign: "right",
  },
  thTax: {
    flex: 1.1,
    textAlign: "right",
  },
  thAmount: {
    flex: 1.3,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  td: {
    paddingHorizontal: 4,
    fontSize: 9,
  },
  tdDescription: {
    flex: 3,
  },
  tdQty: {
    flex: 1,
    textAlign: "center",
  },
  tdPrice: {
    flex: 1.3,
    textAlign: "right",
  },
  tdTax: {
    flex: 1.1,
    textAlign: "right",
  },
  tdAmount: {
    flex: 1.3,
    textAlign: "right",
    fontWeight: "bold",
  },
  smallMuted: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  totalsContainer: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsCard: {
    width: 200,
    padding: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalsLabel: {
    fontSize: 9,
  },
  totalsValue: {
    fontSize: 9,
  },
  totalsGrandRow: {
    borderTopWidth: 0.5,
    borderTopColor: "#d1d5db",
    marginTop: 4,
    paddingTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalsGrandValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  recurringSection: {
    marginTop: 10,
  },
  recurringTable: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 6,
    overflow: "hidden",
  },
  recurringHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#ecfdf3",
    paddingVertical: 3,
  },
  recurringTh: {
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: "bold",
    color: "#047857",
  },
  recurringRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1fae5",
    paddingVertical: 3,
  },
  recurringCell: {
    paddingHorizontal: 4,
    fontSize: 8,
  },
  recurringStatusSuccess: {
    color: "#059669",
    fontWeight: "bold",
  },
  recurringStatusFailed: {
    color: "#dc2626",
    fontWeight: "bold",
  },
  termsSection: {
    marginTop: 12,
  },
  termsText: {
    fontSize: 8,
    marginBottom: 2,
  },
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const InvoicePdf: React.FC<InvoicePdfProps> = ({
  invoice,
  user,
  subscription,
  recurringPayments,
  logoUrl,
}) => {
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

  const createdDate = formatDate(invoice.created_at);
  const startDate = subscription?.startAt ? formatDate(subscription.startAt) : "-";
  const hasRecurring = recurringPayments && recurringPayments.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.companyBlock}>
            {/* Logo + company name */}
            <View style={styles.logoRow}>
              {logoUrl ? (
                <Image src={logoUrl} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoFallback}>RB</Text>
              )}
              <Text style={styles.companyName}>
                RENTBUDDY FURNISHING SOLUTIONS PVT. LTD.
              </Text>
            </View>

            <Text style={styles.companyText}>Anurag Nagar 64 A Indore</Text>
            <Text style={styles.companyText}>
              Indore 452011, Madhya Pradesh, India
            </Text>
            <Text style={styles.companyText}>Phone: 9039383900</Text>
            <Text style={styles.companyText}>Email: rentbuddyrb@gmail.com</Text>
            <Text style={styles.companyText}>GSTIN: 23AALCR9879E1ZT</Text>
          </View>

          <View style={styles.invoiceMeta}>
            <Text style={styles.invoiceLabel}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Order #</Text>
              <Text style={styles.metaValue}>{invoice.orderId || "-"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Order Date</Text>
              <Text style={styles.metaValue}>{createdDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Start Date</Text>
              <Text style={styles.metaValue}>{startDate}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Plan</Text>
              <Text style={styles.metaValue}>
                {invoice.paymentType === "Recurring Payment"
                  ? "Recurring Rental Plan"
                  : "One-time Rental"}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaKey}>Payment Method</Text>
              <Text style={styles.metaValue}>
                {invoice.paymentMethod || "-"}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.card}>
            <View style={styles.billToRow}>
              <View>
                <Text style={styles.billToName}>{billToName}</Text>
                {billToLines.map((l, i) => (
                  <Text key={i} style={styles.companyText}>
                    {l}
                  </Text>
                ))}
                {user?.customerId && (
                  <Text style={styles.companyText}>
                    Customer ID: {user.customerId}
                  </Text>
                )}
                {user?.phone && (
                  <Text style={styles.companyText}>Phone: {user.phone}</Text>
                )}
                {user?.email && (
                  <Text style={styles.companyText}>Email: {user.email}</Text>
                )}
              </View>

              <View>
                <Text style={styles.companyText}>
                  Payment Type: {invoice.paymentType}
                </Text>
                {invoice.billingInfo?.emiDate && (
                  <Text style={styles.companyText}>
                    EMI Date: {invoice.billingInfo.emiDate}
                  </Text>
                )}
                {subscription && (
                  <Text style={styles.companyText}>
                    Subscription Status: {subscription.status}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Rental Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental Items</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, styles.thDescription]}>Description</Text>
              <Text style={[styles.th, styles.thQty]}>Qty</Text>
              <Text style={[styles.th, styles.thPrice]}>Unit Price</Text>
              <Text style={[styles.th, styles.thTax]}>Taxes</Text>
              <Text style={[styles.th, styles.thAmount]}>Amount</Text>
            </View>

            {/* Rows */}
            {invoice.items.map((item, idx) => {
              const name =
                item.productId?.productName || `Item ${idx + 1}`;
              const qty = item.quantity || 1;
              const unitPrice = item.price || 0;
              const lineAmount = qty * unitPrice;

              return (
                <View key={idx} style={styles.tableRow}>
                  <View style={[styles.td, styles.tdDescription]}>
                    <Text>{name}</Text>
                    {item.rentalDuration && (
                      <Text style={styles.smallMuted}>
                        Rental Duration: {item.rentalDuration}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.td, styles.tdQty]}>{qty}</Text>
                  <Text style={[styles.td, styles.tdPrice]}>
                    Rs.{unitPrice.toLocaleString("en-IN")}
                  </Text>
                  <Text style={[styles.td, styles.tdTax]}>Included</Text>
                  <Text style={[styles.td, styles.tdAmount]}>
                    Rs.{lineAmount.toLocaleString("en-IN")}
                  </Text>
                </View>
              );
            })}
          </View>

        {/* Totals */}
          <View style={styles.totalsContainer}>
            <View style={[styles.card, styles.totalsCard]}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>
                  Rs.{invoice.totals.subtotal.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>CGST</Text>
                <Text style={styles.totalsValue}>
                  Rs.{invoice.totals.cgst.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>IGST</Text>
                <Text style={styles.totalsValue}>
                  Rs.{invoice.totals.igst.toLocaleString("en-IN")}
                </Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Security Deposit</Text>
                <Text style={styles.totalsValue}>
                  Rs.{invoice.totals.depositAmount.toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.totalsGrandRow}>
                <Text style={styles.totalsLabel}>Total</Text>
                <Text style={styles.totalsGrandValue}>
                  Rs.{invoice.totals.totalAmount.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recurring payments */}
        {hasRecurring && (
          <View style={styles.recurringSection}>
            <Text style={styles.sectionTitle}>Recurring Payment History</Text>
            <View style={styles.recurringTable}>
              <View style={styles.recurringHeaderRow}>
                <Text style={[styles.recurringTh, { flex: 1.5 }]}>
                  Payment Date
                </Text>
                <Text style={[styles.recurringTh, { flex: 1 }]}>Month</Text>
                <Text style={[styles.recurringTh, { flex: 1 }]}>Amount</Text>
                <Text style={[styles.recurringTh, { flex: 1 }]}>Status</Text>
                <Text style={[styles.recurringTh, { flex: 1 }]}>Method</Text>
              </View>

              {recurringPayments.map((p, idx) => {
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
                  <View key={p.id || idx} style={styles.recurringRow}>
                    <Text style={[styles.recurringCell, { flex: 1.5 }]}>
                      {dateLabel}
                    </Text>
                    <Text style={[styles.recurringCell, { flex: 1 }]}>
                      {monthLabel}
                    </Text>
                    <Text style={[styles.recurringCell, { flex: 1 }]}>
                      ₹{p.amount.toLocaleString("en-IN")}
                    </Text>
                    <Text
                      style={[
                        styles.recurringCell,
                        { flex: 1 },
                        isSuccess
                          ? styles.recurringStatusSuccess
                          : styles.recurringStatusFailed,
                      ]}
                    >
                      {p.status}
                    </Text>
                    <Text style={[styles.recurringCell, { flex: 1 }]}>
                      {p.method}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            1. This invoice covers furniture and appliance rental services for
            the items listed. All items remain the property of Rentbuddy
            Furnishing Solutions Pvt. Ltd.
          </Text>
          <Text style={styles.termsText}>
            2. Monthly rental fees are due on or before the due date. Late
            payments may attract additional charges as per your policy.
          </Text>
          <Text style={styles.termsText}>
            3. Deposits are refundable post inspection of all items. Deductions
            may apply for damage, loss, or missing accessories.
          </Text>
          <Text style={styles.termsText}>
            4. The renter is responsible for maintaining the rented items in
            good condition and notifying Rentbuddy of any issues.
          </Text>
          <Text style={styles.termsText}>
            5. This agreement is governed by the laws of Madhya Pradesh and any
            disputes fall under Indore jurisdiction.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
