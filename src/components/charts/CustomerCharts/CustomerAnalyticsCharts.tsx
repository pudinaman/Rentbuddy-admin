
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

/* -------------------------------------------------
   TYPES
------------------------------------------------- */

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

type SubscriptionStats = {
  subscribed: number;
  unsubscribed: number;
};

type CustomerTypes = {
  newCustomers: number;
  returningCustomers: number;
};

/* -------------------------------------------------
   COLORS
------------------------------------------------- */

const donutColors = ["#4f46e5", "#22c55e", "#f97316", "#f43f5e", "#0ea5e9"];

/* -------------------------------------------------
   SAFE DONUT BUILDER
------------------------------------------------- */

function buildDonutOptions(
  labels: string[],
  formatter: (value: number) => string
): ApexOptions {
  return {
    labels: labels ?? ["No Data"],
    colors: donutColors,
    chart: { type: "donut", foreColor: "#0f172a" },
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: {
      theme: "light",
      fillSeriesColor: false,
      y: { formatter },
    },
  };
}

/* -------------------------------------------------
   LINE CHART — MONTHLY GROWTH (SAFE)
------------------------------------------------- */

export function CustomerGrowthChart({
  data,
}: {
  data: MonthlyCustomerPoint[];
}) {
  const safeData = Array.isArray(data) ? data : [];

  const categories =
    safeData.length > 0 ? safeData.map((d) => d.label || "") : ["No Data"];

  const counts =
    safeData.length > 0 ? safeData.map((d) => d.count || 0) : [0];

  const options: ApexOptions = {
    chart: {
      type: "line",
      height: 280,
      toolbar: { show: false },
      foreColor: "#64748b",
    },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
      axisBorder: { show: false },
    },
    colors: ["#4f46e5"],
    grid: {
      borderColor: "#e2e8f0",
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      y: { formatter: (v) => `${v} customers` },
    },
  };

  const series = [
    {
      name: "Customers",
      data: counts,
    },
  ];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart options={options} series={series} type="line" height={280} />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   CITY BAR CHART (HORIZONTAL — SAFE)
------------------------------------------------- */

export function CustomersByCityChart({ data }: { data: CityBreakdown[] }) {
  const safe = Array.isArray(data) ? data : [];

  const categories =
    safe.length > 0 ? safe.map((d) => d.city || "Unknown") : ["No Data"];

  const seriesData =
    safe.length > 0 ? safe.map((d) => d.count || 0) : [0];

  const options: ApexOptions = {
    chart: { type: "bar", height: 260, toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "55%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    colors: ["#10b981"],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { formatter: (v) => `${v}`, style: { fontSize: "11px" } },
    },
    tooltip: { y: { formatter: (v) => `${v} customers` } },
    grid: {
      borderColor: "#e2e8f0",
      xaxis: { lines: { show: true } },
    },
  };

  const series = [{ name: "Customers", data: seriesData }];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart options={options} series={series} type="bar" height={260} />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   PINCODE BAR CHART (SAFE)
------------------------------------------------- */

export function CustomersByPincodeChart({
  data,
}: {
  data: PincodeBreakdown[];
}) {
  const safe = Array.isArray(data) ? data : [];

  const categories =
    safe.length > 0 ? safe.map((d) => d.pincode || "Unknown") : ["No Data"];

  const seriesData =
    safe.length > 0 ? safe.map((d) => d.count || 0) : [0];

  const options: ApexOptions = {
    chart: { type: "bar", height: 260, toolbar: { show: false } },
    colors: ["#f97316"],
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
    },
    tooltip: { y: { formatter: (v) => `${v} customers` } },
    grid: {
      borderColor: "#e2e8f0",
      yaxis: { lines: { show: true } },
    },
  };

  const series = [{ name: "Customers", data: seriesData }];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart options={options} series={series} type="bar" height={260} />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   SUBSCRIBED VS UNSUBSCRIBED DONUT (SAFE)
------------------------------------------------- */

export function SubscriptionBreakdownChart({
  data,
}: {
  data: SubscriptionStats;
}) {
  const safe = data || { subscribed: 0, unsubscribed: 0 };

  const labels = ["Subscribed", "Unsubscribed"];
  const seriesData = [safe.subscribed ?? 0, safe.unsubscribed ?? 0];

  const options = buildDonutOptions(labels, (v) => `${v} users`);

  return (
    <Chart options={options} series={seriesData} type="donut" height={230} />
  );
}

/* -------------------------------------------------
   NEW VS RETURNING DONUT (SAFE)
------------------------------------------------- */

export function NewVsReturningChart({ data }: { data: CustomerTypes }) {
  const safe = data || { newCustomers: 0, returningCustomers: 0 };

  const labels = ["New Customers", "Returning Customers"];
  const seriesData = [safe.newCustomers ?? 0, safe.returningCustomers ?? 0];

  const options = buildDonutOptions(labels, (v) => `${v} users`);

  return (
    <Chart options={options} series={seriesData} type="donut" height={230} />
  );
}
