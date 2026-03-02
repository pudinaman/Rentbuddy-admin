import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import AllProductTableSkeletonRow from "../loader/AllProductTableSkeletonRow";

type ProductRow = {
  _id: string;
  productName: string;
  category: string;
  rentalPrice: number;
  stocks: number;
  city?: string;
  createdAt?: string;
};

export default function AllProductTableOne() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["productList"],
    queryFn: productService.getProductList,
  });

  const products: ProductRow[] = data?.data || [];

  /* 🔍 Search */
  const filtered = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase())
  );

  /* Pagination */
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / productsPerPage);
  console.log("Rendered AllProductTableOne");
  console.log("Products:", products);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative">
        {/* Header + Search */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Products
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage products, inventory, and barcode lifecycle.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search product, category or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-semibold text-left"
                >
                  Product
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-semibold text-left"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-semibold text-left"
                >
                  City
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-semibold text-left"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-semibold text-left"
                >
                  Stock
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 font-semibold text-left"
                >
                  Created
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {isLoading ? (
                Array.from({ length: productsPerPage }).map((_, i) => (
                  <AllProductTableSkeletonRow key={i} />
                ))
              ) : current.length > 0 ? (
                current.map((p: ProductRow) => (
                  <TableRow
                    key={p._id}
                    onClick={() => navigate(`/allproducts/${p._id}`)}
                    className="group cursor-pointer border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                  >
                    <TableCell className="px-4 py-4 font-medium text-slate-900 dark:text-slate-50 text-left">
                      {p.productName}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 text-left">
                      {p.category}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 text-left">
                      {p.city || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-800 dark:text-slate-200 text-left">
                      ₹{p.rentalPrice}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200 text-left">
                      {p.stocks}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 text-left">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No products found. Try adjusting your search.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {currentPage}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                of {totalPages} pages
              </span>
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              windowSize={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}
