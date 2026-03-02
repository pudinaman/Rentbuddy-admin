import React, { useEffect, useState } from "react";
import axios from "axios";

import Badge from "../../components/ui/badge/Badge";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  GroupIcon,
  BoxIconLine,
} from "../../icons";

import {
  RevenueByMonthChart,
  RevenueByProductChart,
  RevenueByStateDonut,
  PaymentTypeDonut,
  PaymentStatusDonut,
  SubscriptionCycleStatusChart,
} from "../../components/charts/BillingCharts/BillingCharts";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

type Summary = {
  totalUsers: number;
  monthlyNewUsers: number;
  totalSubscriptions: number;
  totalActiveSubscriptions: number;
  totalPaidAmount: number;
  totalPaidCount: number;
  monthlyPaidAmount: number;
  monthlyPaidCount: number;
  totalPendingAmount: number;
  totalPendingCount: number;
};

type MonthlyPoint = {
  year: number;
  month: number;
  label: string;
  totalAmount: number;
};

type PaymentStatusBreakdown = {
  status: string;
  amount: number;
  count: number;
};

type PaymentTypeBreakdown = {
  paymentType: string;
  amount: number;
  count: number;
};

type ProductRevenue = {
  productName: string;
  revenue: number;
  orders: number;
};

type StateRevenue = {
  state: string;
  revenue: number;
  orders: number;
};

type BillingAnalytics = {
  summary: Summary;
  paymentStatusBreakdown: PaymentStatusBreakdown[];
  paymentTypeBreakdown: PaymentTypeBreakdown[];
  monthlyRevenue: MonthlyPoint[];
  revenueByProduct: ProductRevenue[];
  revenueByState: StateRevenue[];
};

type SubscriptionsAnalytics = {
  totalSubscriptions: number;
  countsByCycle: {
    paid: number;
    not_due_yet: number;
    in_grace: number;
    overdue: number;
    unknown: number;
  };
  amountByCycle: {
    paid: number;
    not_due_yet: number;
    in_grace: number;
    overdue: number;
    unknown: number;
  };
};

export default function BillingDashboard() {
  const [billing, setBilling] = useState<BillingAnalytics | null>(null);
  const [subsAnalytics, setSubsAnalytics] =
    useState<SubscriptionsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const [billingRes, subsRes] = await Promise.all([
        axios.get(`${BASE_API_URL}/payments/analytics/billing`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        axios.get(`${BASE_API_URL}/payments/analytics/subscriptions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      setBilling(billingRes.data.data);
      setSubsAnalytics(subsRes.data.data);
    } catch (err) {
      console.error("Error loading billing analytics:", err);
      setError("Failed to load billing analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const summary = billing?.summary;

  /* ================= FULL-PAGE LOADING SKELETON ================= */
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

        {/* Second row metric skeletons */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="mt-4 h-7 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
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

  /* ================= REAL DASHBOARD (AFTER LOADING) ================= */

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Billing & Subscription Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Insights into revenue, subscriptions, and payment health.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={false}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          ⟳ Refresh
        </button>
      </div>

      {/* Error (if any) */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-700 shadow-sm dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={
                <GroupIcon className="size-6 text-slate-800 dark:text-slate-50" />
              }
              title="Total Customers"
              value={summary.totalUsers}
              badge={
                <Badge color="success">
                  <ArrowUpIcon />
                  +{summary.monthlyNewUsers} this month
                </Badge>
              }
            />

            <MetricCard
              icon={
                <BoxIconLine className="size-6 text-slate-800 dark:text-slate-50" />
              }
              title="Active Subscriptions"
              value={summary.totalActiveSubscriptions}
              badge={
                <Badge color="success">
                  <ArrowUpIcon />
                  {summary.totalSubscriptions} total
                </Badge>
              }
            />

            <MetricCard
              icon={
                <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹
                </span>
              }
              title="Total Collected (All Time)"
              value={`₹${summary.totalPaidAmount.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}`}
              badge={
                <Badge color="success">
                  <ArrowUpIcon />
                  {summary.totalPaidCount} payments
                </Badge>
              }
            />

            <MetricCard
              icon={
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  ₹
                </span>
              }
              title="Collected This Month"
              value={`₹${summary.monthlyPaidAmount.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}`}
              badge={
                <Badge
                  color={summary.monthlyPaidAmount > 0 ? "success" : "error"}
                >
                  {summary.monthlyPaidAmount > 0 ? (
                    <ArrowUpIcon />
                  ) : (
                    <ArrowDownIcon />
                  )}
                  {summary.monthlyPaidCount} payments
                </Badge>
              }
            />
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <MetricCard
              icon={
                <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  ₹
                </span>
              }
              title="Pending / Failed Amount"
              value={`₹${summary.totalPendingAmount.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}`}
              badge={
                <Badge color="error">
                  <ArrowDownIcon />
                  {summary.totalPendingCount} dues
                </Badge>
              }
            />

            <MetricCard
              icon={
                <span className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  Σ
                </span>
              }
              title="Collection Ratio"
              value={
                summary.totalPaidAmount + summary.totalPendingAmount > 0
                  ? `${Math.round(
                      (summary.totalPaidAmount /
                        (summary.totalPaidAmount +
                          summary.totalPendingAmount)) *
                        100
                    )}% collected`
                  : "No data"
              }
              badge={
                <Badge color="success">
                  {summary.totalPaidCount} paid · {summary.totalPendingCount} pending
                </Badge>
              }
            />

            {subsAnalytics && (
              <MetricCard
                icon={
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                    ∞
                  </span>
                }
                title="Recurring Health"
                value={`${subsAnalytics.countsByCycle.paid} paid / ${subsAnalytics.countsByCycle.overdue} overdue`}
                badge={
                  <Badge color="success">
                    {subsAnalytics.totalSubscriptions} subs
                  </Badge>
                }
              />
            )}
          </div>
        </>
      )}

      {/* Charts Section */}
      {billing && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          <GlassCard
            title="Monthly Revenue (Last 12 Months)"
            subtitle="Total successful payments per month."
          >
            <RevenueByMonthChart data={billing.monthlyRevenue} />
          </GlassCard>

          <GlassCard
            title="Payment Mix"
            subtitle="Cumulative vs Recurring & status breakdown."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PaymentTypeDonut data={billing.paymentTypeBreakdown} />
              <PaymentStatusDonut data={billing.paymentStatusBreakdown} />
            </div>
          </GlassCard>

          <GlassCard
            title="Top Products by Revenue"
            subtitle="Which products bring the most rental revenue."
          >
            <RevenueByProductChart data={billing.revenueByProduct} />
          </GlassCard>

          <GlassCard
            title="Geo & Subscription Health"
            subtitle="Revenue by state and subscription cycle status."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RevenueByStateDonut data={billing.revenueByState} />
              {subsAnalytics && (
                <SubscriptionCycleStatusChart data={subsAnalytics} />
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable UI ---------- */

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

      <div className="mt-4 flex-col items-center  gap-6">
        <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
          {value}
        </div>

        {badge && <div className=" text-[10px] ">{badge}</div>}
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
