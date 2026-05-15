import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import ProductBarcodeTable from "./ProductBarcodeTable";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId!),
    enabled: !!productId,
  });

  const product = data?.product;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/30 p-6 text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-white/10 bg-rose-50 p-6 text-sm text-rose-500 dark:bg-rose-950/20">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PRODUCT SUMMARY */}
      <div className="rounded-2xl border border-white/10 bg-white/40 p-5 backdrop-blur-xl dark:bg-slate-900/60">
        <h2 className="text-xl font-semibold">{product.productName}</h2>
        <p className="text-sm text-slate-500">{product.category}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="City" value={product.city || "—"} />
          <Stat label="Price" value={`₹${product.rentalPrice}`} />
          <Stat label="Stock" value={product.stocks} />
          <Stat label="Deposit" value={`₹${product.deposit}`} />
        </div>
      </div>

      {/* BARCODE TABLE */}
      <ProductBarcodeTable />
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="rounded-xl bg-white/60 p-4 text-center dark:bg-slate-800/60">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
