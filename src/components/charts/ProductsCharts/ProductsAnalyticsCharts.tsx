
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

/* -------------------------------------------------
   TYPES (MATCH YOUR PRODUCT ANALYTICS RESPONSE)
------------------------------------------------- */

type MonthlyPoint = {
  year: number;
  month: number;
  label: string;
  count: number;
};

type CityBreakdown = {
  city: string;
  count: number;
};

type CategoryBreakdown = {
  category: string;
  count: number;
};

type ProductRentStat = {
  productName: string;
  rentCount: number;
};

/* -------------------------------------------------
   COLORS
------------------------------------------------- */

const donutColors = ["#4f46e5", "#22c55e", "#f97316", "#f43f5e", "#0ea5e9"];

/* -------------------------------------------------
   DONUT BUILDER (Reusable)
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
   MONTHLY PRODUCT GROWTH (Line Chart)
------------------------------------------------- */

export function ProductGrowthChart({ data }: { data: MonthlyPoint[] }) {
  const safe = Array.isArray(data) ? data : [];

  const categories =
    safe.length > 0 ? safe.map((d) => d.label) : ["No Data"];

  const counts =
    safe.length > 0 ? safe.map((d) => d.count) : [0];

  const options: ApexOptions = {
    chart: { type: "line", toolbar: { show: false }, foreColor: "#64748b" },
    stroke: { curve: "smooth", width: 3 },
    dataLabels: { enabled: false },
    colors: ["#4f46e5"],
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
    },
    grid: {
      borderColor: "#e2e8f0",
      yaxis: { lines: { show: true } },
    },
    tooltip: { y: { formatter: (v) => `${v} products added` } },
  };

  const series = [{ name: "Products Added", data: counts }];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart type="line" options={options} series={series} height={280} />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   CATEGORY BREAKDOWN (Horizontal Bar)
------------------------------------------------- */

export function ProductsByCategoryChart({
  data,
}: {
  data: CategoryBreakdown[];
}) {
  const safe = Array.isArray(data) ? data : [];

  const categories =
    safe.length > 0 ? safe.map((d) => d.category || "Unknown") : ["No Data"];

  const counts = safe.length > 0 ? safe.map((d) => d.count) : [0];

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "55%",
      },
    },
    colors: ["#22c55e"],
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
    },
    tooltip: {
      y: { formatter: (val) => `${val} products` },
    },
    grid: { borderColor: "#e2e8f0" },
  };

  const series = [{ name: "Products", data: counts }];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart type="bar" options={options} series={series} height={260} />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   CITY BREAKDOWN (Bar)
------------------------------------------------- */

export function ProductsByCityChart({ data }: { data: CityBreakdown[] }) {
  const safe = Array.isArray(data) ? data : [];

  const categories =
    safe.length > 0 ? safe.map((d) => d.city || "Unknown") : ["No Data"];

  const counts = safe.length > 0 ? safe.map((d) => d.count) : [0];

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    colors: ["#f97316"],
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: { style: { fontSize: "11px" } },
    },
    tooltip: { y: { formatter: (v) => `${v} products` } },
    grid: { borderColor: "#e2e8f0" },
  };

  const series = [{ name: "Products", data: counts }];

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[680px]">
        <Chart type="bar" options={options} series={series} height={260} />
      </div>
    </div>
  );
}

/* -------------------------------------------------
   TOP RENTED PRODUCTS (Donut)
------------------------------------------------- */

export function TopRentedProductsDonut({
  data,
}: {
  data: ProductRentStat[];
}) {
  const safe = Array.isArray(data) ? data : [];

  const labels =
    safe.length > 0 ? safe.map((p) => p.productName) : ["No Data"];

  const values =
    safe.length > 0 ? safe.map((p) => p.rentCount) : [0];

  const options = buildDonutOptions(labels, (v) => `${v} rentals`);

  return (
    <Chart type="donut" options={options} series={values} height={250} />
  );
}
