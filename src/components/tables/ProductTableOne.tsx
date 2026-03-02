import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  MoreVertical,
  Pencil,
  Tag,
  Trash2,
  Plus,
  ChevronDown,
} from "lucide-react";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import ModalWrapper from "../../layout/ModalWrapper";
import { Pagination } from "../ui/pagination/Pagination";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

function EditProductForm({
  product,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  isAdd = false,
  isLoading,
}: {
  product: any;
  onChange: (
    e:
      | React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
      | { target: { name: string; value: string } }
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isAdd?: boolean;
  isLoading?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const categoryLabel = product.category || "Select category";

  // Update image preview when file changes
  useEffect(() => {
    if (product.image) {
      // If product.image is a File object (upload)
      if (product.image instanceof File) {
        const objectUrl = URL.createObjectURL(product.image);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl); // cleanup
      }
      // If product.image is already a URL (edit mode)
      if (typeof product.image === "string") {
        setPreview(product.image);
      }
    } else {
      setPreview(null);
    }
  }, [product.image]);

  // helper to change category via DropdownItem
  const handleCategorySelect = (value: string) => {
    onChange({ target: { name: "category", value } } as any);
    setIsCategoryOpen(false);
  };

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-4">
      {/* Product Name and Category (flex layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            value={product.productName || ""}
            onChange={onChange}
            placeholder="Enter product name"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
            required
          />
        </div>

        {/* Category as Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Category
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className="dropdown-toggle flex w-full items-center justify-between gap-2 rounded-lg border
                         bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition
                         hover:bg-gray-50 
                         dark:bg-gray-900 dark:text-white"
            >
              <span>{categoryLabel}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isCategoryOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            <Dropdown
              isOpen={isCategoryOpen}
              onClose={() => setIsCategoryOpen(false)}
              className="w-full"
            >
              <DropdownItem onItemClick={() => handleCategorySelect("")}>
                Select category
              </DropdownItem>
              <DropdownItem onItemClick={() => handleCategorySelect("Bedroom")}>
                Bedroom
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleCategorySelect("Living Room")}
              >
                Living Room
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleCategorySelect("Dining Room")}
              >
                Dining Room
              </DropdownItem>
              <DropdownItem onItemClick={() => handleCategorySelect("Storage")}>
                Storage
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleCategorySelect("Appliances")}
              >
                Appliances
              </DropdownItem>
              <DropdownItem
                onItemClick={() => handleCategorySelect("Work From Home")}
              >
                Work From Home
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Rental Price & Cost Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Rental Price
          </label>
          <input
            type="text"
            name="rentalPrice"
            value={product.rentalPrice || ""}
            onChange={onChange}
            placeholder="per month"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Cost Price
          </label>
          <input
            type="text"
            name="costPrice"
            value={product.costPrice || ""}
            onChange={onChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Deposit & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Deposit
          </label>
          <input
            type="text"
            name="deposit"
            value={product.deposit || ""}
            onChange={onChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
          />
        </div>

      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          City
        </label>
        <input
          type="text"
          name="city"
          value={product.city || ""}
          onChange={onChange}
          placeholder="Enter city"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Description
        </label>
        <textarea
          name="description"
          value={product.description || ""}
          onChange={onChange}
          placeholder="Enter product description"
          className="w-full px-4 py-2 border rounded-lg text-base h-24 resize-none dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* File Upload with preview */}
      <div>
        <label className="block mb-1 font-medium dark:text-white">
          Upload Product Image
        </label>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium py-2.5 px-5 rounded-lg transition duration-300 hover:from-blue-600 hover:to-indigo-700 active:scale-95">
            <input
              type="file"
              name="productImage" // optional; actual key comes from FormData mapping
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            Choose Image
          </label>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-md border border-gray-300"
            />
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? (isAdd ? "Adding..." : "Saving...") : (isAdd ? "Add Product" : "Save Changes")}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface Offer {
  offerCode?: string;
  discount?: string;
  validity?: string;
  minimumAmount?: string;
  date?: string;
}

function EditOfferForm({
  offer,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
}: {
  offer: Offer;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-2">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Offer Code
        </label>
        <input
          type="text"
          name="offerCode"
          value={offer.offerCode || ""}
          onChange={onChange}
          placeholder="Enter offer code"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Discount
        </label>
        <input
          type="text"
          name="discount"
          value={offer.discount || ""}
          onChange={onChange}
          placeholder="Enter discount"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Validity (Days)
        </label>
        <input
          type="text"
          name="validity"
          value={offer.validity || ""}
          onChange={onChange}
          placeholder="Validity in days"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Minimum Amount
        </label>
        <input
          type="text"
          name="minimumAmount"
          value={offer.minimumAmount || ""}
          onChange={onChange}
          placeholder="Minimum order amount"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-white">
          Expiry Date
        </label>
        <input
          type="date"
          name="date"
          value={offer.date || ""}
          onChange={onChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base dark:text-white transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-2">
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Saving Offer..." : "Save Offer"}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EditDurationDiscountForm({
  discount,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
}: {
  discount: {
    threeMonths: string;
    sixMonths: string;
    twelveMonths: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 dark:text-white text-gray-dark"
    >
      <div>
        <label className="block text-sm mb-1 dark:text-white text-gray-dark">
          3 Months Discount
        </label>
        <input
          type="text"
          name="threeMonths"
          value={discount.threeMonths}
          onChange={onChange}
          placeholder="Discount % or amount"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 dark:text-white text-gray-dark">
          6 Months Discount
        </label>
        <input
          type="text"
          name="sixMonths"
          value={discount.sixMonths}
          onChange={onChange}
          placeholder="Discount % or amount"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 dark:text-white text-gray-dark">
          12 Months Discount
        </label>
        <input
          type="text"
          name="twelveMonths"
          value={discount.twelveMonths}
          onChange={onChange}
          placeholder="Discount % or amount"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Saving Discount..." : "Save Discount"}
        </Button>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
function UpdateStockForm({
  currentStock,
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
}: {
  currentStock: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Current Stock: <b>{currentStock}</b>
      </p>

      <input
        type="number"
        min="0"
        value={value}
        onChange={onChange}
        placeholder="Enter new stock quantity"
        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white"
      />

      <div className="flex gap-3 pt-3">
        <Button variant="primary" className="flex-1" onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update"}
        </Button>
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function ProductTableOne() {
  interface Product {
    _id: string;
    productName: string;
    sku?: string;
    serialNumber?: string;
    category: string;
    rentalPrice: number;
    availability: string;
    offer?: Offer;
    durationsDiscount?: {
      threeMonths?: string;
      sixMonths?: string;
      twelveMonths?: string;
    };
    stocks?: number;
    productId?: string;
  }

  // const [products, setProducts] = useState<Product[]>([]); // REPLACED BY USEQUERY
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({
    newStock: "",
  });

  const categoryLabel = categoryFilter || "All Categories";
  const statusLabel = statusFilter || "All Statuses";

  const [modal, setModal] = useState<{
    open: boolean;
    type: string;
    product: Product | null;
  }>({ open: false, type: "", product: null });

  const [editProduct, setEditProduct] = useState<{
    _id?: string;
    productName?: string;
    category?: string;
    rentalPrice?: string | number;
    costPrice?: string | number;
    deposit?: string | number;
    stocks?: string | number;
    city?: string;
    description?: string;
    image?: File | string | null;
  }>({});

  const [editOffer, setEditOffer] = useState({});
  const [editDiscount, setEditDiscount] = useState({
    threeMonths: "",
    sixMonths: "",
    twelveMonths: "",
  });

  const itemsPerPage = 10;
  // const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

  const [newProduct, setNewProduct] = useState({
    productName: "",
    category: "",
    rentalPrice: "",
    costPrice: "",
    deposit: "",
    stocks: "",
    city: "",
    description: "",
    image: null as File | null,
  });

  /* --------------------------------------
     QUERY: Fetch Products
  -------------------------------------- */
  const queryClient = useQueryClient();

  const { data: productData, isLoading } = useQuery({
    queryKey: ["products", currentPage, itemsPerPage, ""],
    queryFn: () => productService.getProducts(currentPage, itemsPerPage, ""),
    placeholderData: (previousData) => previousData,
  });

  const products = productData?.data || [];
  const totalPages = productData?.totalPages || 1;
  const totalItems = productData?.totalProducts || 0;


  /* --------------------------------------
     MUTATIONS
  -------------------------------------- */
  const addStockMutation = useMutation({
    mutationFn: (vars: { id: string; amount: number }) =>
      productService.addStock(vars.id, vars.amount),
    onSuccess: () => {
      toast.success("Stock added successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add stock");
    },
  });

  const removeStockMutation = useMutation({
    mutationFn: (vars: { id: string; amount: number }) =>
      productService.removeStock(vars.id, vars.amount),
    onSuccess: () => {
      toast.success("Stock removed successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove stock");
    },
  });

  const editProductMutation = useMutation({
    mutationFn: (data: any) => productService.editProduct(data),
    onSuccess: () => {
      toast.success("Product edited successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to edit product");
    },
  });

  const editOfferMutation = useMutation({
    mutationFn: (vars: { id: string; data: any }) =>
      productService.editOffers(vars.id, vars.data),
    onSuccess: () => {
      toast.success("Offer updated successfully");
      closeModal();
    },
    onError: () => {
      toast.error("Failed to update offer");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const editDiscountMutation = useMutation({
    mutationFn: (vars: { id: string; data: any }) =>
      productService.addDurationDiscount(vars.id, vars.data),
    onSuccess: () => {
      toast.success("Discount updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to update discount");
    },
  });

  const addProductMutation = useMutation({
    mutationFn: (formData: FormData) => productService.addProduct(formData),
    onSuccess: () => {
      toast.success("Product added successfully!");
      setNewProduct({
        productName: "",
        category: "",
        rentalPrice: "",
        costPrice: "",
        deposit: "",
        stocks: "",
        city: "",
        description: "",
        image: null,
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to add product");
    },
  });

  const handleUpdateStock = async () => {
    if (!modal.product?._id) return;

    const currentStock = modal.product.stocks || 0;
    const newStock = Number(stockUpdate.newStock);

    if (isNaN(newStock) || newStock < 0) {
      toast.error("Invalid stock value");
      return;
    }

    const diff = newStock - currentStock;

    if (diff === 0) {
      toast.info("Stock unchanged");
      closeModal();
      return;
    }

    if (diff > 0) {
      addStockMutation.mutate({ id: modal.product._id, amount: diff });
    } else {
      removeStockMutation.mutate({ id: modal.product._id, amount: Math.abs(diff) });
    }
  };

  const handleEditProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { image, ...productData } = editProduct;
    // Note: Image upload logic in original code was using JSON? 
    // `editProduct` state had `image` which could be File or string.
    // The original request sent `productData` (without image) as JSON.
    // It seems image handling might be missing or handled elsewhere in original code? 
    // "const { image, ...productData } = editProduct;" -> image is stripped.
    // So I will do the same.
    editProductMutation.mutate(productData);
  };

  const handleEditOfferSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modal.product?._id) {
      toast.error("Product ID missing");
      return;
    }
    editOfferMutation.mutate({ id: modal.product._id, data: editOffer });
  };

  const filtered = (Array.isArray(products) ? products : []).filter((p) => {
    return (
      (!search ||
        p?.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p?.sku?.toString().toLowerCase().includes(search.toLowerCase()) ||
        p?.serialNumber?.toLowerCase().includes(search.toLowerCase())) &&
      (!categoryFilter ||
        p?.category?.toLowerCase().includes(categoryFilter.toLowerCase())) &&
      (!statusFilter ||
        p?.availability?.toLowerCase() === statusFilter.toLowerCase())
    );
  });

  // Remove duplicate totalPages calculation here, use the state value instead
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = filtered;

  interface AvailabilityBadgeProps {
    availability?: string | null;
  }

  const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
    availability,
  }) => {
    const map: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      rented: "bg-amber-100 text-amber-700",
      maintenance: "bg-blue-100 text-blue-700",
      unavailable: "bg-red-100 text-red-700",
    };
    const style =
      map[availability?.toLowerCase() || ""] || "bg-gray-100 text-gray-700";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {availability ? availability.toUpperCase() : "—"}
      </span>
    );
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openModal = (type: string, product: Product | null) => {
    setModal({ open: true, type, product });
    setMenuOpen(null);
    if (type === "edit-product") setEditProduct({ ...(product || {}) });
    if (type === "edit-offer") setEditOffer({ ...(product?.offer || {}) });
    if (type === "view-discount") {
      setEditDiscount({
        threeMonths: product?.durationsDiscount?.threeMonths || "",
        sixMonths: product?.durationsDiscount?.sixMonths || "",
        twelveMonths: product?.durationsDiscount?.twelveMonths || "",
      });
    }
    if (type === "update-stock") {
      setStockUpdate({
        newStock: String(product?.stocks ?? 0),
      });
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: "", product: null });
  };

  const handleEditProductChange = (
    e:
      | React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setEditProduct((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setEditProduct((prev: any) => ({ ...prev, image: file }));
  };

  const handleEditOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditOffer((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditDiscount((prev) => ({ ...prev, [name]: value }));
  };






  const handleNewProductChange = (
    e:
      | React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setNewProduct((prev) => ({ ...prev, image: file }));
  };

  const handleDeleteProduct = () => {
    if (!modal.product?._id) {
      toast.error("Product ID missing");
      return;
    }
    deleteProductMutation.mutate(modal.product._id);
  };

  const handleEditDiscountSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!modal.product?._id) {
      toast.error("Product ID missing");
      return;
    }
    editDiscountMutation.mutate({ id: modal.product._id, data: editDiscount });
  };

  const handleAddProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    (Object.keys(newProduct) as (keyof typeof newProduct)[]).forEach((key) => {
      const value = newProduct[key];
      if (value !== null && value !== undefined) {
        const formKey =
          key === "stocks"
            ? "stock"
            : key === "image"
              ? "productImage"
              : key;


        const safeFormKey = String(formKey);

        if (value instanceof File) {
          formData.append(safeFormKey, value);
        } else {
          formData.append(safeFormKey, String(value));
        }
      }
    });

    addProductMutation.mutate(formData);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Product Table
        </h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by Product, SKU, Serial No..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1]
               bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none
               focus:ring-2 focus:ring-gray-700 dark:text-white"
          />

          {/* CATEGORY FILTER DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-300
                 dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-sm"
              onClick={() => setCatOpen((prev) => !prev)}
            >
              <span>{categoryLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <Dropdown
              isOpen={catOpen}
              onClose={() => setCatOpen(false)}
              className="w-48"
            >
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("");
                  setCatOpen(false);
                }}
              >
                All Categories
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("Bedroom");
                  setCatOpen(false);
                }}
              >
                Bedroom
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("Living Room");
                  setCatOpen(false);
                }}
              >
                Living Room
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("Dining Room");
                  setCatOpen(false);
                }}
              >
                Dining Room
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("Storage");
                  setCatOpen(false);
                }}
              >
                Storage
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("Appliances");
                  setCatOpen(false);
                }}
              >
                Appliances
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setCategoryFilter("Work From Home");
                  setCatOpen(false);
                }}
              >
                Work From Home
              </DropdownItem>
            </Dropdown>
          </div>

          {/* STATUS FILTER DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-gray-300
                 dark:border-neutral-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-sm"
              onClick={() => setStatusOpen((prev) => !prev)}
            >
              <span>{statusLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <Dropdown
              isOpen={statusOpen}
              onClose={() => setStatusOpen(false)}
              className="w-48"
            >
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("");
                  setStatusOpen(false);
                }}
              >
                All Statuses
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("available");
                  setStatusOpen(false);
                }}
              >
                Available
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("rented");
                  setStatusOpen(false);
                }}
              >
                Rented
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("maintenance");
                  setStatusOpen(false);
                }}
              >
                Maintenance
              </DropdownItem>
              <DropdownItem
                onItemClick={() => {
                  setStatusFilter("unavailable");
                  setStatusOpen(false);
                }}
              >
                Unavailable
              </DropdownItem>
            </Dropdown>
          </div>

          {/* ADD PRODUCT BUTTON */}
          <Button
            className="flex items-center gap-2 px-3 py-2 text-white"
            onClick={() =>
              setModal({ open: true, type: "add-product", product: null })
            }
          >
            <Plus className="w-5 h-5" /> Add Product
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                SR No
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Product
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Serial Number
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Category
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Rental Price
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Status
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 dark:text-white text-gray-dark"
              >
                Details
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 text-center dark:text-white text-gray-dark"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : current.length > 0 ? (
              current.map((p, index) => (
                <TableRow key={p._id}>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    {indexOfFirst + index + 1}
                  </TableCell>
                  <TableCell className="px-0 py-4 dark:text-white text-gray-dark ">
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium">
                        {p.productName || "—"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Stock: {p.stocks ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark text-center">
                    {p.productId || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark text-center">
                    {p.category || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4 dark:text-white text-gray-dark">
                    ₹{p.rentalPrice + "/month" || "—"}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <AvailabilityBadge availability={p.availability} />
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Button
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => openModal("view-discount", p)}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-center relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setMenuOpen(p._id)}
                    >
                      <MoreVertical className="w-5 h-5 text-gray-700 dark:text-white" />
                    </button>
                    {menuOpen === p._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-9 top-14 z-10 min-w-[180px] bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 text-left"
                      >
                        <button
                          className="flex rounded-t-lg items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                          onClick={() => openModal("edit-product", p)}
                        >
                          <Pencil className="w-4 h-4" /> Edit Product
                        </button>
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                          onClick={() => openModal("edit-offer", p)}
                        >
                          <Tag className="w-4 h-4" /> Edit Offer
                        </button>
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                          onClick={() => openModal("update-stock", p)}
                        >
                          <Plus className="w-4 h-4" /> Update Stock
                        </button>

                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-100 dark:hover:bg-gray-700 text-red-600 rounded-b-lg"
                          onClick={() => openModal("delete", p)}
                        >
                          <Trash2 className="w-4 h-4" /> Delete Product
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No products found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}

      {products.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages} — Total {totalItems} products
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)} // triggers fetch
            windowSize={3}
          />
        </div>
      )}

      {/* Modals */}
      <ModalWrapper
        isOpen={modal.open && modal.type === "update-stock"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Update Stock
        </h3>

        <UpdateStockForm
          currentStock={modal.product?.stocks || 0}
          value={stockUpdate.newStock}
          onChange={(e) => setStockUpdate({ newStock: e.target.value })}
          onSubmit={handleUpdateStock}
          onCancel={closeModal}
          isLoading={addStockMutation.isPending || removeStockMutation.isPending}
        />
      </ModalWrapper>

      <ModalWrapper
        isOpen={modal.open && modal.type === "edit-product"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Edit Product
        </h3>
        <EditProductForm
          product={editProduct}
          onChange={handleEditProductChange}
          onFileChange={handleProductFileChange}
          onSubmit={handleEditProductSubmit}
          onCancel={closeModal}
          isLoading={editProductMutation.isPending}
        />
      </ModalWrapper>

      <ModalWrapper
        isOpen={modal.open && modal.type === "edit-offer"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Edit Offer
        </h3>
        <EditOfferForm
          offer={editOffer as Offer}
          onChange={handleEditOfferChange}
          onSubmit={handleEditOfferSubmit}
          onCancel={closeModal}
          isLoading={editOfferMutation.isPending}
        />
      </ModalWrapper>

      <ModalWrapper
        isOpen={modal.open && modal.type === "delete"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-red-600">
          Delete Product
        </h3>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Are you sure you want to delete&nbsp;
          <span className="font-medium text-gray-900 dark:text-white">
            {modal.product?.productName}
          </span>
          ?
        </p>
        <div className="flex gap-4 mt-6">
          <Button variant="outline" className="flex-1" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleDeleteProduct}
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </ModalWrapper>

      <ModalWrapper
        isOpen={modal.open && modal.type === "view-discount"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Update Duration Discount
        </h3>
        <EditDurationDiscountForm
          discount={editDiscount}
          onChange={handleEditDiscountChange}
          onSubmit={handleEditDiscountSubmit}
          onCancel={closeModal}
          isLoading={editDiscountMutation.isPending}
        />
      </ModalWrapper>

      <ModalWrapper
        isOpen={modal.open && modal.type === "add-product"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Add Product
        </h3>
        <EditProductForm
          product={newProduct}
          onChange={handleNewProductChange}
          onFileChange={handleNewProductFileChange}
          onSubmit={handleAddProductSubmit}
          onCancel={closeModal}
          isAdd={true}
          isLoading={addProductMutation.isPending}
        />
      </ModalWrapper>
    </div>
  );
}