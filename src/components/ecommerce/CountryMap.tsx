import React from "react";
import { VectorMap } from "@react-jvectormap/core";
import { inMill } from "@react-jvectormap/india";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services/dashboardService";

/** Normalized coordinates keyed by lowercase single-space state names */
const stateCoordinates: Record<string, [number, number]> = {
  gujarat: [22.2587, 71.1924],
  "madhya pradesh": [22.9734, 78.6569],
  maharashtra: [19.7515, 75.7139],
  rajasthan: [27.0238, 74.2179],
  "uttar pradesh": [26.8467, 80.9462],
  karnataka: [15.3173, 75.7139],
  "tamil nadu": [11.1271, 78.6569],
  "andhra pradesh": [15.9129, 79.74],
  telangana: [18.1124, 79.0193],
  kerala: [10.8505, 76.2711],
  "west bengal": [22.9868, 87.855],
  punjab: [31.1471, 75.3412],
  haryana: [29.0588, 76.0856],
  bihar: [25.0961, 85.3131],
  odisha: [20.9517, 85.0985],
  "himachal pradesh": [31.1048, 77.1734],
  uttarakhand: [30.0668, 79.0193],
  jharkhand: [23.6102, 85.2799],
  chhattisgarh: [21.2787, 81.8661],
  assam: [26.2006, 92.9376],
  goa: [15.2993, 74.124],
};

const normalizeStateName = (name: string): string =>
  name.toLowerCase().trim().replace(/\s+/g, " ");

interface OrderData {
  name: string;
  ordersCount: number;
  totalProducts: number;
  totalAmount: number;
}

type AggregatedData = Record<
  string,
  {
    name: string;
    ordersCount: number;
    totalProducts: number;
    totalAmount: number;
  }
>;

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["ordersByState"],
    queryFn: dashboardService.getOrdersByState,
  });

  const ordersData: OrderData[] = React.useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    if (rawData.success && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, [rawData]);

  const aggregatedData: AggregatedData = React.useMemo(() => {
    return ordersData.reduce((acc, item) => {
      if (!item?.name) return acc;
      const normalized = normalizeStateName(item.name);
      const skip = new Set(["state", "india", "mp", "n/a", "null"]);
      if (skip.has(normalized)) return acc;

      if (!acc[normalized]) {
        acc[normalized] = {
          name: item.name,
          ordersCount: 0,
          totalProducts: 0,
          totalAmount: 0,
        };
      }

      acc[normalized].ordersCount += Number(item.ordersCount) || 0;
      acc[normalized].totalProducts += Number(item.totalProducts) || 0;
      acc[normalized].totalAmount += Number(item.totalAmount) || 0;

      return acc;
    }, {} as AggregatedData);
  }, [ordersData]);

  type Marker = {
    latLng: [number, number];
    name: string;
    style: {
      fill: string;
      r: number;
    };
  };

  const markers = React.useMemo(() => {
    return Object.entries(aggregatedData)
      .map(([key, data]) => {
        const coords = stateCoordinates[key];
        if (!coords) return null;
        const orders = data.ordersCount ?? 0;
        const size = Math.max(4, Math.min(Math.round(orders / 5), 15));
        return {
          latLng: coords,
          name: `${data.name}\nOrders: ${orders}\nProducts: ${
            data.totalProducts ?? 0
          }\nAmount: ₹${(data.totalAmount ?? 0).toFixed(2)}`,
          style: {
            fill: mapColor ?? "#465FFF",
            r: size,
          },
        } as Marker;
      })
      .filter((m): m is Marker => m !== null);
  }, [aggregatedData, mapColor]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="h-full relative z-10">
      <style>{`.jvectormap-tip { z-index: 100 !important; }`}</style>

      {/* Keep VectorMap typing intact by casting just the props object to the component's props type */}
      <VectorMap
        {...({
          map: inMill,
          backgroundColor: "transparent",
          containerStyle: { width: "100%", height: "100%" },
          containerClassName: "relative z-10",
          markerStyle: {
            initial: {
              fill: mapColor ?? "#465FFF",
              stroke: "#ffffff",
              strokeWidth: 2,
              strokeOpacity: 1,
              r: 6,
            },
            hover: {
              fill: "#2E47D9",
              cursor: "pointer",
              r: 8,
            },
          },
          markers,
        } as unknown as React.ComponentProps<typeof VectorMap>)}
      />

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Orders by State</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {Object.entries(aggregatedData)
            .sort((a, b) => b[1].ordersCount - a[1].ordersCount)
            .slice(0, 6)
            .map(([key, data]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: mapColor ?? "#465FFF" }}
                  aria-hidden
                />
                <span className="font-medium">{data.name}:</span>
                <span className="text-gray-600">{data.ordersCount} orders</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CountryMap;
