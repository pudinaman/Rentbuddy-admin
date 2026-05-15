import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import { barcodeService } from "../../services/barcodeService";
import SidebarProducts from "../../components/rental/SidebarProducts";
import BarcodeTable from "../../components/rental/BarcodeTable";
import RentalHistoryPanel from "../../components/rental/RentalHistoryPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "../ui/pagination/Pagination";

/* ===================== TYPES ===================== */

export interface RentalItem {
  productID: string;
  productSerialID: string;
  rentalDuration: string;
  productName: string;
  rentalPrice: number;
}

export interface CurrentRental {
  customerID?: {
    _id: string;
    username: string;
    email: string;
  };
  orderID?: string;
  rentedDate?: string;
  rentedTill?: string;
}

export interface RentalHistoryEntry {
  _id: string;
  customerID: {
    _id: string;
    username: string;
    email: string;
  };
  orderID: string;
  rentedDate: string;
  rentedTill: string;
  rentalPrice: number;
  conditionAtReturn: string;
}

export interface BarcodeRecord {
  _id: string;
  brID: string;
  rentalItem: RentalItem;
  currentRental?: CurrentRental | null;
  rentalHistory?: RentalHistoryEntry[];
  createdAt?: string;
}

interface SidebarProduct {
  _id: string;
  productID: string;
  productName: string;
  rentalPrice: number;
}

/* ===================== PAGE ===================== */

const RentalStockPage: React.FC = () => {
  /* ---------- STATE ---------- */
  const [selectedProductID, setSelectedProductID] = useState<string | null>(null);
  const [selectedBarcode, setSelectedBarcode] =
    useState<BarcodeRecord | null>(null);

  /* ---------- PAGINATION ---------- */
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ===================== API CALLS ===================== */

  // 🔹 Fetch ALL products for sidebar
  const { data: productData, isLoading: loadingProducts } = useQuery({
    queryKey: ["productsForBr"],
    queryFn: productService.getForbr,
  });

  const products: SidebarProduct[] = useMemo(() => {
    const list = productData?.data?.map((p: any) => ({
      _id: p._id,
      productID: p.productID,
      productName: p.productName,
      rentalPrice: p.rentalPrice,
    })) || [];

    if (!selectedProductID && list.length > 0) {
      setSelectedProductID(list[0].productID);
    }
    return list;
  }, [productData, selectedProductID]);

  // 🔹 Fetch barcodes by selected product
  const { data: barcodeData, isLoading: loadingBarcodes, error: barcodeError } = useQuery({
    queryKey: ["barcodesByProduct", selectedProductID, page, limit],
    queryFn: () => barcodeService.getBarcodesByProductId(selectedProductID!, page, limit),
    enabled: !!selectedProductID,
  });

  const barcodes: BarcodeRecord[] = barcodeData?.data || [];
  const totalPages = barcodeData?.totalPages || 1;

  const loading = loadingProducts || loadingBarcodes;
  const error = barcodeError ? (barcodeError as any).message : "";

  /* ===================== HELPERS ===================== */

  const goBack = () => setSelectedBarcode(null);

  /* ===================== UI ===================== */

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64">
          <SidebarProducts
            products={products}
            selectedProductID={selectedProductID}
            onSelectProduct={(id) => {
              setSelectedProductID(id);
              setSelectedBarcode(null);
              setPage(1);
            }}
          />
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Rental Stock
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View and manage rental items, barcodes, and rental history.
            </p>
          </div>

          <div className="mb-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="cursor-pointer hover:underline">Home</span> /
            <span
              className="cursor-pointer hover:underline"
              onClick={() => setSelectedBarcode(null)}
            >
              Rental Stock
            </span>
            {selectedBarcode && <span>/ History</span>}
          </div>

          <div className="max-w-full overflow-hidden rounded-xl border border-white/20 bg-white/30 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
            {loading && (
              <p className="py-10 text-center text-sm text-blue-600">
                Loading rental barcodes...
              </p>
            )}

            {error && (
              <p className="py-10 text-center text-sm text-rose-500">
                {error}
              </p>
            )}

            <AnimatePresence mode="wait">
              {!loading && !error && selectedBarcode === null && (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18 }}
                >
                  <BarcodeTable
                    barcodes={barcodes}
                    onSelectBarcode={setSelectedBarcode}
                  />

                  {barcodes.length > 0 && (
                    <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
                      <p className="flex items-center gap-1">
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                          {page}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          of {totalPages} pages
                        </span>
                      </p>

                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        windowSize={3}
                        className="w-full sm:w-auto"
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {selectedBarcode && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <RentalHistoryPanel
                    selectedBarcode={selectedBarcode}
                    onBack={goBack}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalStockPage;
