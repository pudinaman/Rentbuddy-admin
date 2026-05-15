import { useState, Fragment } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ChevronDown } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Pagination } from "../ui/pagination/Pagination";

interface Product {
  _id: string;
  productName: string;
  stocks: number;
  city?: string;
}

interface TrackingRow {
  trackingId: string;
  productName: string;
  city: string;
  remainingStock: number;
}

const itemsPerPage = 10;

const TrackTableOne: React.FC = () => {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cityDropdown, setCityDropdown] = useState(false);

  const { data: products = [], isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ["trackProducts"],
    queryFn: productService.trackProducts,
  });

  const makeTrackingId = (name: string) =>
    name
      ? name
        .split(" ")
        .slice(0, 4)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
      : "N/A";

  const rows: TrackingRow[] = products.map((p: Product) => ({
    trackingId: `${makeTrackingId(p.productName)}#${p._id.slice(-4)}`,
    productName: p.productName,
    city: p.city || "N/A",
    remainingStock: p.stocks,
  }));

  const filtered = rows.filter(
    (row) =>
      (!search ||
        row.trackingId.toLowerCase().includes(search.toLowerCase()) ||
        row.productName.toLowerCase().includes(search.toLowerCase())) &&
      (!cityFilter || row.city.toLowerCase() === cityFilter.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);

  const cityOptions = Array.from(
    new Set(products.map((p: Product) => p.city).filter(Boolean))
  );

  return (
    <Fragment>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">

        {/* HEADER + FILTERS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Product Tracking
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by Tracking ID or Product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1]
              bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none 
              focus:ring-2 focus:ring-gray-700 dark:text-white"
            />

            {/* CITY FILTER DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdown((p) => !p)}
                className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-300 
                dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg
                focus:outline-none shadow-sm text-sm"
              >
                <span>{cityFilter || "All Cities"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <Dropdown
                isOpen={cityDropdown}
                onClose={() => setCityDropdown(false)}
                className="w-48"
              >
                <DropdownItem
                  onItemClick={() => {
                    setCityFilter("");
                    setCityDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  All Cities
                </DropdownItem>

                {cityOptions.map((city) => (
                  <DropdownItem
                    key={city}
                    onItemClick={() => {
                      setCityFilter(city ?? "");
                      setCityDropdown(false);
                      setCurrentPage(1);
                    }}
                  >
                    {city}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-auto rounded-lg">
          {isLoading && <p className="text-center py-8 text-blue-600">Loading...</p>}
          {isError && <p className="text-center py-8 text-red-600">{error?.message || "Failed to fetch product data"}</p>}

          {!isLoading && !isError && (
            <Table>
              <TableHeader className="border-b bg-gray-50 dark:bg-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 dark:text-white">Tracking ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white">Product</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-center">City</TableCell>
                  <TableCell isHeader className="px-5 py-3 dark:text-white text-center">Remaining Stock</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {current.length > 0 ? (
                  current.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-5 py-3 text-center dark:text-white">{row.trackingId}</TableCell>
                      <TableCell className="px-5 py-3 text-center dark:text-white">{row.productName}</TableCell>
                      <TableCell className="px-5 py-3 text-center dark:text-white">{row.city}</TableCell>
                      <TableCell className="px-5 py-3 text-center dark:text-white">{row.remainingStock}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500 italic">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* PAGINATION */}
        {filtered.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              windowSize={3}
            />
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default TrackTableOne;
