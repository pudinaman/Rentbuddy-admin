import { useQuery } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { dashboardService } from "../../services/dashboardService";

type RevenueMonth = {
  label: string;
  totalAmount: number;
};

export default function MonthlySalesChart() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["orderAnalytics"],
    queryFn: dashboardService.getOrderAnalytics,
  });

  // Process data for chart
  const revenueByMonth: RevenueMonth[] = analyticsData?.data?.revenueByMonth || [];
  const categories = revenueByMonth.map((m) => m.label);
  const series = [
    {
      name: "Sales",
      data: revenueByMonth.map((m) => m.totalAmount),
    },
  ];

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val.toLocaleString()}`,
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: {
        formatter: (val) => `₹${val.toLocaleString()}`,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
      </div>

      {/* Chart */}
      <div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {isLoading ? (
            <div className="h-[180px] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ) : (
            <Chart options={options} series={series} type="bar" height={180} />
          )}
        </div>
      </div>
    </div>
  );
}
