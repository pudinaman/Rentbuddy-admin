import React, { useEffect, useState } from "react";
import axios from "axios";

import Badge from "../../components/ui/badge/Badge";
import {
  ArrowUpIcon,
  
  GroupIcon,
  BoxIconLine,
} from "../../icons";

import {
  CustomerGrowthChart,
  CustomersByCityChart,
  CustomersByPincodeChart,
  SubscriptionBreakdownChart,
  NewVsReturningChart,
} from "../../components/charts/CustomerCharts/CustomerAnalyticsCharts";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

/* ---------- TYPES ---------- */

type Summary = {
  totalCustomers: number;
  newCustomersThisMonth: number;
  subscribedCustomers: number;
  unsubscribedCustomers: number;
  topCity: string | null;
  topPincode: string | null;
};

type MonthlyCustomerPoint = {
  year: number;
  month: number;
  label: string;
  count: number;
};

type CityBreakdown = {
  city: string;
  count: number;
};

type PincodeBreakdown = {
  pincode: string;
  count: number;
};

type CustomerTypeStats = {
  newCustomers: number;
  returningCustomers: number;
};

type CustomerAnalytics = {
  summary: Summary;
  monthlyGrowth: MonthlyCustomerPoint[];
  cityBreakdown: CityBreakdown[];
  pincodeBreakdown: PincodeBreakdown[];
  customerTypeStats: CustomerTypeStats;
  subscriptionStats: { subscribed: number; unsubscribed: number };
};

export default function CustomerDashboard() {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_API_URL}/user/customerStats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const raw = res.data.stats;

      console.log("Customer Analytics Raw Response:", raw);

      /* ---------- MAP BACKEND RESPONSE INTO UI FORMAT ---------- */
     

      console.log("RAW CUSTOMER ANALYTICS:", raw);

      const mapped: CustomerAnalytics = {
        summary: {
          totalCustomers: raw.totalCustomers,
          newCustomersThisMonth: raw.newCustomersThisMonth,
          subscribedCustomers: raw.subscribedCustomers,
          unsubscribedCustomers: raw.unsubscribedCustomers,
          topCity: raw.customersByCity?.[0]?._id || "Unknown",
          topPincode: raw.customersByPincode?.[0]?._id || "Unknown",
        },

        monthlyGrowth: [
          {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            label: "This Month",
            count: raw.newCustomersThisMonth,
          },
        ],

        cityBreakdown:
          raw.customersByCity?.map((c: any) => ({
            city: c._id || "Unknown",
            count: c.count,
          })) || [],

        pincodeBreakdown:
          raw.customersByPincode?.map((p: any) => ({
            pincode: p._id || "Unknown",
            count: p.count,
          })) || [],

        customerTypeStats: {
          newCustomers: raw.newCustomersThisMonth,
          returningCustomers: raw.totalCustomers - raw.newCustomersThisMonth,
        },

        subscriptionStats: {
          subscribed: raw.subscribedCustomers,
          unsubscribed: raw.unsubscribedCustomers,
        },
      };

      setAnalytics(mapped);
    } catch (err) {
      console.error("Error loading customer analytics:", err);
      setError("Failed to load customer analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* ---------- SKELETON LOADING UI ---------- */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="h-6 w-56 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-72 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[170px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse h-52"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- REAL DASHBOARD UI ---------- */

  const summary = analytics?.summary;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Customer Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Insights into your user base, growth, geography, and subscription
            health.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          ⟳ Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/50 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={
                <GroupIcon className="size-6 text-slate-900 dark:text-slate-50" />
              }
              title="Total Customers"
              value={summary.totalCustomers}
              badge={
                <Badge color="success">
                  <ArrowUpIcon /> +{summary.newCustomersThisMonth} this month
                </Badge>
              }
            />

            <MetricCard
              icon={
                <BoxIconLine className="size-6 text-blue-700 dark:text-blue-300" />
              }
              title="Subscribed Customers"
              value={summary.subscribedCustomers}
              badge={<Badge color="success">Active Subs</Badge>}
            />

            <MetricCard
              icon={
                <BoxIconLine className="size-6 text-amber-600 dark:text-amber-300" />
              }
              title="Unsubscribed"
              value={summary.unsubscribedCustomers}
              badge={<Badge color="error">Not Subscribed</Badge>}
            />

            <MetricCard
              icon={<span className="font-semibold">📍</span>}
              title="Top City"
              value={summary.topCity}
              badge={<Badge color="primary">Most Customers</Badge>}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <MetricCard
              icon={<span className="font-semibold">🏷️</span>}
              title="Top Pincode"
              value={summary.topPincode}
            />

            <MetricCard
              icon={< ArrowUpIcon  />}
              title="Growth Rate"
              value={
                summary.totalCustomers > 0
                  ? `${Math.round(
                      (summary.newCustomersThisMonth / summary.totalCustomers) *
                        100
                    )}%`
                  : "0%"
              }
            />

            <MetricCard
              icon={<span className="text-xl">👥</span>}
              title="Returning vs New"
              value={`${analytics?.customerTypeStats.returningCustomers} / ${analytics?.customerTypeStats.newCustomers}`}
            />
          </div>
        </>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 gap-6">
          <GlassCard title="Monthly Customer Growth">
            <CustomerGrowthChart data={analytics.monthlyGrowth} />
          </GlassCard>

          <GlassCard title="Customer Geography">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomersByCityChart data={analytics.cityBreakdown} />
              <CustomersByPincodeChart data={analytics.pincodeBreakdown} />
            </div>
          </GlassCard>

          <GlassCard title="Subscription Breakdown">
            <SubscriptionBreakdownChart data={analytics.subscriptionStats} />
          </GlassCard>

          <GlassCard title="New vs Returning Customers">
            <NewVsReturningChart data={analytics.customerTypeStats} />
          </GlassCard>
        </div>
      )}
    </div>
  );
}

/* ---------- Reusable UI Components ---------- */

function MetricCard({
  icon,
  title,
  value,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number | null;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[170px] flex-col justify-between rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </span>
      </div>

      <div className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {value}
      </div>

      {badge && <div className="mt-2 text-[10px]">{badge}</div>}
    </div>
  );
}

function GlassCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
