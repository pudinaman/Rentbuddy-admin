import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { dashboardService } from "../../services/dashboardService";

/* 🔹 Skeleton loader for metrics */
function MetricSkeleton() {
  return (
    <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
  );
}

export default function EcommerceMetrics() {
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ["customerStats"],
    queryFn: dashboardService.getCustomerStats,
  });

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["orderAnalytics"],
    queryFn: dashboardService.getOrderAnalytics,
  });

  const loading = customerLoading || orderLoading;

  // Process Customer Data
  const totalCustomers = customerData?.success ? customerData.stats.totalCustomers : 0;

  // Process Order Data
  let totalOrders = 0;
  let orderGrowth = 0;
  let isOrderUp: boolean | null = null;

  if (orderData?.success) {
    const summary = orderData.data.summary;
    totalOrders = summary.totalOrders;
    const currentMonth = summary.monthlyOrders;
    const prevMonth = summary.prevMonthOrders || 0;

    if (prevMonth === 0) {
      isOrderUp = true;
      orderGrowth = 100;
    } else {
      const diff = ((currentMonth - prevMonth) / prevMonth) * 100;
      orderGrowth = Math.abs(Number(diff.toFixed(1)));
      isOrderUp = diff >= 0;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* ================= Customers ================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <GroupIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? <MetricSkeleton /> : totalCustomers.toLocaleString()}
            </h4>
          </div>

          {!loading && isOrderUp !== null && (
            <Badge color="success">
              <ArrowUpIcon />
              Active
            </Badge>
          )}
        </div>
      </div>

      {/* ================= Orders ================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxIconLine className="size-6 text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {loading ? <MetricSkeleton /> : totalOrders.toLocaleString()}
            </h4>
          </div>

          {!loading && isOrderUp !== null && (
            <Badge color={isOrderUp ? "success" : "error"}>
              {isOrderUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {orderGrowth}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
