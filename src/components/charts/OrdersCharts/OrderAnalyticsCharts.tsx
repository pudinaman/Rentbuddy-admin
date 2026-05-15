import type { ReactNode } from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

/* ------------------ TYPES ------------------ */

export type MonthlyRevenue = {
  label: string;
  totalAmount: number;
  orders: number;
  avgOrderValue: number;
};

export type ProductRevenue = {
  productName: string;
  revenue: number;
  orders: number;
};

export type StateRevenue = {
  state: string;
  revenue: number;
  orders: number;
};

export type PaymentTypeBreakdown = {
  paymentType: string;
  amount: number;
  count: number;
};

export type PaymentStatusBreakdown = {
  status: string;
  amount: number;
  count: number;
};

export type TopCustomer = {
  name: string;
  email: string;
  spent: number;
  totalOrders: number;
};

/* ---------------- SAFETY WRAPPER ---------------- */
function SafeChart({
  data,
  children,
}: {
  data: unknown;
  children: ReactNode;
}) {
  if (!data || !Array.isArray(data) || data.length === 0)
    return (
      <div className="w-full py-10 text-center text-sm text-slate-400">
        No Data Available
      </div>
    );
  return <>{children}</>;
}

/* ---------- Shared Donut Base ---------- */

const donutColors = ["#4f46e5", "#22c55e", "#f97316", "#f43f5e", "#0ea5e9"];

function buildDonut(
  labels: string[] = [],
  format: (v: number) => string
): ApexOptions {
  return {
    labels: labels.length > 0 ? labels : ["No Data"],
    colors: donutColors,
    chart: {
      type: "donut",
      foreColor: "#0f172a",
      background: "transparent",
    },
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
      style: {
        fontSize: "12px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      },
      y: {
        formatter: format,
      },
    },
  };
}

/* ------------------ CHARTS ------------------ */

/* 1️⃣ Revenue by Month (Bar) */
export function RevenueByMonth({ data }: { data: MonthlyRevenue[] }) {
  return (
    <SafeChart data={data}>
      <Chart
        type="bar"
        height={260}
        series={[{ name: "Revenue", data: data.map((d) => d.totalAmount || 0) }]}
        options={
          {
            colors: ["#4f46e5"],
            chart: {
              toolbar: { show: false },
              background: "transparent",
            },
            plotOptions: {
              bar: {
                columnWidth: "40%",
                borderRadius: 6,
                borderRadiusApplication: "end",
              },
            },
            dataLabels: { enabled: false },
            xaxis: {
              categories: data.map((d) => d.label || ""),
              labels: { style: { fontSize: "11px" } },
            },
            tooltip: {
              y: {
                formatter: (v: number) => `₹${v.toLocaleString("en-IN")}`,
              },
            },
          } as ApexOptions
        }
      />
    </SafeChart>
  );
}

/* 2️⃣ Monthly Orders Count (Line) */
export function OrdersTrend({ data }: { data: MonthlyRevenue[] }) {
  return (
    <SafeChart data={data}>
      <Chart
        type="line"
        height={250}
        series={[{ name: "Orders", data: data.map((d) => d.orders || 0) }]}
        options={
          {
            chart: {
              toolbar: { show: false },
              background: "transparent",
            },
            stroke: { width: 3, curve: "smooth" },
            markers: { size: 4 },
            xaxis: {
              categories: data.map((d) => d.label || ""),
            },
            tooltip: {
              y: {
                formatter: (v: number) => `${v} orders`,
              },
            },
          } as ApexOptions
        }
      />
    </SafeChart>
  );
}

/* 3️⃣ Average Order Value Trend (Line) */
export function AvgOrderValueChart({ data }: { data: MonthlyRevenue[] }) {
  return (
    <SafeChart data={data}>
      <Chart
        type="line"
        height={250}
        series={[
          { name: "Avg Order Value", data: data.map((d) => d.avgOrderValue || 0) },
        ]}
        options={
          {
            chart: {
              toolbar: { show: false },
              background: "transparent",
            },
            stroke: { width: 3, curve: "smooth" },
            markers: { size: 4 },
            xaxis: {
              categories: data.map((d) => d.label || ""),
            },
            tooltip: {
              y: {
                formatter: (v: number) => `₹${Number(v).toFixed(2)}`,
              },
            },
          } as ApexOptions
        }
      />
    </SafeChart>
  );
}

/* 4️⃣ Top Products Revenue (Horizontal) */
export function TopProductsChart({ data }: { data: ProductRevenue[] }) {
  const formatted =
    data?.map((i) => ({
      name: i.productName || "Unknown",
      value: i.revenue || 0,
    })) || [];
  return <RevenueBar data={formatted} title="Revenue by Product" />;
}

/* 5️⃣ Top Customers (Horizontal Bar) */
export function TopCustomersChart({ data }: { data: TopCustomer[] }) {
  const formatted =
    data?.map((i) => ({
      name: i.name || "Unknown",
      value: i.spent || 0,
    })) || [];
  return <RevenueBar data={formatted} title="Top Spending Customers" />;
}

/* 🔥 Common Safe Bar Component */
function RevenueBar({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title: string;
}) {
  return (
    <SafeChart data={data}>
      <Chart
        type="bar"
        height={280}
        series={[
          {
            name: "Revenue",
            data: data.map((d) => d.value || 0),
          },
        ]}
        options={
          {
            colors: ["#10b981"],
            chart: {
              toolbar: { show: false },
              background: "transparent",
            },
            plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
            xaxis: {
              categories: data.map((d) => d.name || ""),
              labels: {
                formatter: (v: string | number) => `₹${v}`,
              },
            },
            tooltip: {
              y: {
                formatter: (v: number) =>
                  `₹${v.toLocaleString("en-IN")}`,
              },
            },
            dataLabels: { enabled: false },
            title: {
              text: title,
              align: "left",
              style: { fontSize: "14px", fontWeight: 600 },
            },
          } as ApexOptions
        }
      />
    </SafeChart>
  );
}

/* 6️⃣ Revenue by State */
export function RevenueByState({ data }: { data: StateRevenue[] }) {
  return (
    <SafeChart data={data}>
      <Chart
        type="donut"
        height={240}
        series={data.map((d) => d.revenue || 0)}
        options={buildDonut(
          data.map((d) => d.state || "NA"),
          (v) => `₹${v}`
        )}
      />
    </SafeChart>
  );
}

/* 7️⃣ Payment Type Distribution */
export function PaymentTypeChart({ data }: { data: PaymentTypeBreakdown[] }) {
  return (
    <SafeChart data={data}>
      <Chart
        type="donut"
        height={240}
        series={data.map((d) => d.amount || 0)}
        options={buildDonut(
          data.map((d) => d.paymentType || "Unknown"),
          (v) => `₹${v}`
        )}
      />
    </SafeChart>
  );
}

/* 8️⃣ Payment Status Distribution */
export function PaymentStatusChart({ data }: { data: PaymentStatusBreakdown[] }) {
  return (
    <SafeChart data={data}>
      <Chart
        type="donut"
        height={240}
        series={data.map((d) => d.amount || 0)}
        options={buildDonut(
          data.map((d) => d.status || "Unknown"),
          (v) => `₹${v}`
        )}
      />
    </SafeChart>
  );
}
