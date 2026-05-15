import { useEffect, useState } from "react";
import axios from "axios";

import Badge from "../../components/ui/badge/Badge";
import { ArrowUpIcon, GroupIcon, BoxIconLine } from "../../icons";

/* ---------------- Import ORDER charts ---------------- */
import {
  RevenueByMonth,
  OrdersTrend,
  AvgOrderValueChart,
  TopProductsChart,
  TopCustomersChart,
  RevenueByState,
  PaymentTypeChart,
  PaymentStatusChart,
} from "../../components/charts/OrdersCharts/OrderAnalyticsCharts";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

/* ---------------- TYPES ---------------- */
type Summary = {
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  avgOrderValue: number;
  repeatCustomerRate: number;
};

type OrderAnalytics = {
  summary: Summary;
  revenueByMonth: any[];
  topCustomers: any[];
  productRevenue: any[];
  revenueByState: any[];
  paymentType: any[];
  paymentStatus: any[];
};

/* ----------------------------------------------------- */

export default function OrdersDashboard() {
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_API_URL}/orders/analytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("Order Analytics Response ->", res.data);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load Order Analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const summary = data?.summary;

  /* =====================================================
     ▪▪▪ FULL-PAGE LOADING SKELETON (MATCHES BILLING UI) ▪▪▪
  ====================================================== */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-56 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>

        {/* Top metric skeletons */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="mt-4 h-7 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Chart skeletons */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 h-4 w-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-48 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =====================================================
     ▪▪▪ REAL DASHBOARD UI (MIRRORS BILLING DASHBOARD) ▪▪▪
  ====================================================== */
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Order Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sales performance, customer behaviour & order trends.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={false}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          ⟳ Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700 shadow-sm dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<GroupIcon className="size-6 text-slate-800 dark:text-slate-50" />}
            title="Total Orders"
            value={summary.totalOrders}
            badge={
              <Badge color="success">
                <ArrowUpIcon />
                +{summary.monthlyOrders} this month
              </Badge>
            }
          />

          <MetricCard
            icon={
              <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                ₹
              </span>
            }
            title="Total Revenue"
            value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
            badge={
              <Badge color="success">
                <ArrowUpIcon />
                Revenue growth
              </Badge>
            }
          />

          <MetricCard
            icon={
              <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                Σ
              </span>
            }
            title="Avg Order Value"
            value={`₹${summary.avgOrderValue.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}`}
            badge={<Badge color="success">Healthy AOV</Badge>}
          />

          <MetricCard
            icon={<BoxIconLine className="size-6 text-slate-800 dark:text-slate-50" />}
            title="Repeat Customer Rate"
            value={`${summary.repeatCustomerRate}%`}
            badge={<Badge color="success">Customer retention</Badge>}
          />
        </div>
      )}

      {/* CHARTS */}
      {data && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          <GlassCard
            title="Monthly Performance"
            subtitle="Revenue and order trends over time."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RevenueByMonth data={data.revenueByMonth} />
              <OrdersTrend data={data.revenueByMonth} />
            </div>
            <div className="mt-4">
              <AvgOrderValueChart data={data.revenueByMonth} />
            </div>
          </GlassCard>

          <GlassCard
            title="Top Performing Products"
            subtitle="Products contributing the most to revenue."
          >
            <TopProductsChart data={data.productRevenue} />
          </GlassCard>

          <GlassCard
            title="Top Customers"
            subtitle="Your highest-value customers."
          >
            <TopCustomersChart data={data.topCustomers} />
          </GlassCard>

          <GlassCard
            title="Payment & Geo Insights"
            subtitle="Payment mix and revenue by state."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PaymentTypeChart data={data.paymentType} />
              <PaymentStatusChart data={data.paymentStatus} />
              <RevenueByState data={data.revenueByState} />
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   UI COMPONENTS (SAME AS BILLING DASHBOARD)
===================================================== */
type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  badge?: React.ReactNode;
};

function MetricCard({ icon, title, value, badge }: MetricCardProps) {
  return (
    <div className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-100 bg-white px-6 py-5 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
          {icon}
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      <div className="mt-4 flex-col items-center gap-6">
        <div className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </div>

        {badge && <div className="text-[10px]">{badge}</div>}
      </div>
    </div>
  );
}

type GlassCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

function GlassCard({ title, subtitle, children }: GlassCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
