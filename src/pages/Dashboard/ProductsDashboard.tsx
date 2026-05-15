import React, { useEffect, useState } from "react";
import axios from "axios";

import Badge from "../../components/ui/badge/Badge";
import {
  ArrowUpIcon,
 
  BoxIconLine,
} from "../../icons";

import {
  ProductGrowthChart,
  ProductsByCategoryChart,
  ProductsByCityChart,
  TopRentedProductsDonut,
} from "../../components/charts/ProductsCharts/ProductsAnalyticsCharts";

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

/* -------------------------------------------------
   TYPES
------------------------------------------------- */

type Summary = {
  totalProducts: number;
  newProductsThisMonth: number;
  topCategory: string | null;
  topCity: string | null;
  topProduct: string | null;
};

type MonthlyPoint = {
  year: number;
  month: number;
  label: string;
  count: number;
};

type CategoryBreakdown = {
  category: string;
  count: number;
};

type CityBreakdown = {
  city: string;
  count: number;
};

type ProductRent = {
  productName: string;
  rentCount: number;
};

type ProductAnalytics = {
  summary: Summary;
  monthlyGrowth: MonthlyPoint[];
  categoryBreakdown: CategoryBreakdown[];
  cityBreakdown: CityBreakdown[];
  topRented: ProductRent[];
};

/* -------------------------------------------------
   MAIN COMPONENT
------------------------------------------------- */

export default function ProductDashboard() {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      const res = await axios.get(`${BASE_API_URL}/products/productAnalytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const raw = res.data.analytics;

      console.log("Product Analytics Raw:", raw);

      /* ---------------------------------------------
         MAP BACKEND RESPONSE → UI format
      --------------------------------------------- */

      const mapped: ProductAnalytics = {
        summary: {
          totalProducts: raw.totalProducts,
          newProductsThisMonth: raw.newProductsThisMonth,
          topCategory: raw.productsByCategory?.[0]?._id || "Unknown",
          topCity: raw.productsByCity?.[0]?._id || "Unknown",
          topProduct: raw.topRentedProducts?.[0]?.productName || "Unknown",
        },

        monthlyGrowth: raw.monthlyAddedProducts?.map((m: any) => ({
          year: m.year,
          month: m.month,
          label: `${m.month}/${m.year}`,
          count: m.count,
        })) || [],

        categoryBreakdown:
          raw.productsByCategory?.map((c: any) => ({
            category: c._id || "Unknown",
            count: c.count,
          })) || [],

        cityBreakdown:
          raw.productsByCity?.map((c: any) => ({
            city: c._id || "Unknown",
            count: c.count,
          })) || [],

        topRented:
          raw.topRentedProducts?.map((p: any) => ({
            productName: p.productName || "Unknown",
            rentCount: p.rentCount || 0,
          })) || [],
      };

      setAnalytics(mapped);
    } catch (err) {
      console.error("Error loading product analytics:", err);
      setError("Failed to load product analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* -------------------------------------------------
     LOADING SKELETON
  ------------------------------------------------- */

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

  const summary = analytics?.summary;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 pt-2 lg:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Product Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track growth, categories, cities, and rental performance.
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
              icon={<BoxIconLine className="size-6 text-slate-900 dark:text-slate-50" />}
              title="Total Products"
              value={summary.totalProducts}
              badge={
                <Badge color="success">
                  <ArrowUpIcon /> +{summary.newProductsThisMonth} new
                </Badge>
              }
            />

            <MetricCard
              icon={<span className="text-xl">🏷️</span>}
              title="Top Category"
              value={summary.topCategory}
              badge={<Badge color="primary">Most Items</Badge>}
            />

            <MetricCard
              icon={<span className="text-xl">📍</span>}
              title="Top City"
              value={summary.topCity}
              badge={<Badge color="primary">Most Stock</Badge>}
            />

            <MetricCard
              icon={<span className="text-xl">🔥</span>}
              title="Top Rented Product"
              value={summary.topProduct}
              badge={<Badge color="success">Highest Demand</Badge>}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <MetricCard
              icon={<ArrowUpIcon />}
              title="Growth Rate"
              value={
                summary.totalProducts > 0
                  ? `${Math.round(
                      (summary.newProductsThisMonth / summary.totalProducts) *
                        100
                    )}%`
                  : "0%"
              }
            />

            <MetricCard
              icon={<span className="text-xl">📦</span>}
              title="Categories Tracked"
              value={analytics?.categoryBreakdown.length || 0}
            />

            <MetricCard
              icon={<span className="text-xl">🌆</span>}
              title="Cities Covered"
              value={analytics?.cityBreakdown.length || 0}
            />
          </div>
        </>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 gap-6">
          <GlassCard title="Monthly Product Growth">
            <ProductGrowthChart data={analytics.monthlyGrowth} />
          </GlassCard>

          <GlassCard title="Products by Category">
            <ProductsByCategoryChart data={analytics.categoryBreakdown} />
          </GlassCard>

          <GlassCard title="Products by City">
            <ProductsByCityChart data={analytics.cityBreakdown} />
          </GlassCard>

          <GlassCard title="Top Rented Products">
            <TopRentedProductsDonut data={analytics.topRented} />
          </GlassCard>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------
   REUSABLE UI
------------------------------------------------- */

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
