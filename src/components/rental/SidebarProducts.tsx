import React from "react";

interface SidebarProduct {
  _id: string;          // ✅ Mongo ID (used for selection & API)
  productID: string;    // Business ID (display only)
  productName: string;
  rentalPrice: number;
}

interface Props {
  products: SidebarProduct[];
  selectedProductID: string | null; // stores Mongo _id
  onSelectProduct: (id: string) => void;
}

const SidebarProducts: React.FC<Props> = ({
  products,
  selectedProductID,
  onSelectProduct,
}) => {
  return (
    <aside className="relative z-20 pointer-events-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4 h-[82vh] overflow-y-auto table-scrollbar">
      <h2 className="mb-3 text-lg font-semibold text-gray-dark dark:text-white">
        Products
      </h2>

      <ul className="space-y-2">
        {products.map((p) => {
          const active = p._id === selectedProductID;

          return (
            <li key={p._id}>
              <button
                type="button"
                onClick={() => onSelectProduct(p._id)}   // ✅ FIX
                className={`w-full rounded-md border px-3 py-2 text-left transition
                  ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-transparent dark:text-gray-100 dark:hover:bg-white/[0.05]"
                  }`}
              >
                <div className="text-sm font-medium">{p.productName}</div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {p.productID} • Rent: ₹{p.rentalPrice.toFixed(2)}
                </div>
              </button>
            </li>
          );
        })}

        {products.length === 0 && (
          <li className="text-sm italic text-gray-500">
            No products found.
          </li>
        )}
      </ul>
    </aside>
  );
};

export default SidebarProducts;
