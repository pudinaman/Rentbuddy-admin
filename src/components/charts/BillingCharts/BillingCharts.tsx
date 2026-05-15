import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

/** Shared prop shapes (structural typing, no import needed in dashboard) */
type MonthlyPoint = {
  year: number;
  month: number;
  label: string;
  totalAmount: number;
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

/* ---------- Monthly Revenue (Bar) ---------- */

export function RevenueByMonthChart({ data }: { data: MonthlyPoint[] }) {
  const categories = data.map((d) => d.label);
  const seriesData = data.map((d) => Number(d.totalAmount.toFixed(2)));

  const options: ApexOptions = {
    colors: ["#4f46e5"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 260,
      toolbar: { show: false },
      foreColor: "#64748b",
      animations: { enabled: true },
      background: "transparent", // ✅ match order charts
    },
    theme: { mode: "light" },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "11px" } },
    },
    grid: {
      borderColor: "#e2e8f0",
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
      y: {
        formatter: (val: number) =>
          `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: seriesData,
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart options={options} series={series} type="bar" height={260} />
      </div>
    </div>
  );
}

/* ---------- Revenue by Product (Horizontal Bar) ---------- */

export function RevenueByProductChart({ data }: { data: ProductRevenue[] }) {
  const categories = data.map((d) => d.productName);
  const seriesData = data.map((d) => Number((d.revenue || 0).toFixed(2)));

  const options: ApexOptions = {
    colors: ["#10b981"],
    chart: {
      type: "bar",
      height: 260,
      toolbar: { show: false },
      foreColor: "#64748b",
      background: "transparent", // ✅ consistent bg
    },
    theme: { mode: "light" },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "55%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        formatter: (val: string | number) =>
          `₹${Number(val).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`,
        style: { fontSize: "11px" },
      },
    },
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
      y: {
        formatter: (val: number) =>
          `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
      },
    },
    grid: {
      borderColor: "#e2e8f0",
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
  };

  const series = [
    {
      name: "Revenue",
      data: seriesData,
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart options={options} series={series} type="bar" height={260} />
      </div>
    </div>
  );
}

/* ---------- Shared donut base (colors + tooltip visibility) ---------- */

const donutColors = ["#4f46e5", "#22c55e", "#f97316", "#f43f5e", "#0ea5e9"];

function buildDonutOptions(
  labels: string[],
  tooltipFormatter: (val: number) => string
): ApexOptions {
  return {
    labels,
    colors: donutColors,
    chart: {
      type: "donut",
      foreColor: "#0f172a",
      background: "transparent", // ✅ same glass-card look
    },
    theme: { mode: "light" },
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
        formatter: tooltipFormatter,
      },
    },
  };
}

/* ---------- Revenue by State (Donut) ---------- */

export function RevenueByStateDonut({ data }: { data: StateRevenue[] }) {
  const labels = data.map((d) => d.state || "Unknown");
  const seriesData = data.map((d) => Number((d.revenue || 0).toFixed(2)));

  const options = buildDonutOptions(labels, (val) =>
    `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
  );

  return <Chart options={options} series={seriesData} type="donut" height={230} />;
}

/* ---------- Payment Type Donut ---------- */

export function PaymentTypeDonut({ data }: { data: PaymentTypeBreakdown[] }) {
  const labels = data.map((d) => d.paymentType || "Unknown");
  const seriesData = data.map((d) => Number((d.amount || 0).toFixed(2)));

  const options = buildDonutOptions(labels, (val) =>
    `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
  );

  return <Chart options={options} series={seriesData} type="donut" height={220} />;
}

/* ---------- Payment Status Donut ---------- */

export function PaymentStatusDonut({ data }: { data: PaymentStatusBreakdown[] }) {
  const labels = data.map((d) => d.status || "Unknown");
  const seriesData = data.map((d) => Number((d.amount || 0).toFixed(2)));

  const options = buildDonutOptions(labels, (val) =>
    `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
  );

  return <Chart options={options} series={seriesData} type="donut" height={220} />;
}

/* ---------- Subscription Cycle Status Donut ---------- */

export function SubscriptionCycleStatusChart({
  data,
}: {
  data: SubscriptionsAnalytics;
}) {
  const labels = ["Paid", "Not Due", "In Grace", "Overdue", "Unknown"];
  const seriesData = [
    data.countsByCycle.paid,
    data.countsByCycle.not_due_yet,
    data.countsByCycle.in_grace,
    data.countsByCycle.overdue,
    data.countsByCycle.unknown,
  ];

  const options = buildDonutOptions(labels, (val) => `${val} subs`);

  return <Chart options={options} series={seriesData} type="donut" height={230} />;
}
