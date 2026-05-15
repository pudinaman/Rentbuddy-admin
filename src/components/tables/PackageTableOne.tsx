import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packageService } from "../../services/packageService";
import { productService } from "../../services/productService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import { ChevronDown, Plus, Pencil, Trash2 } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import ModalWrapper from "../../layout/ModalWrapper";
/* ================= TYPES ================= */

interface PackageItem {
  product: string;
  quantity: number;
}

interface Package {
  _id: string;
  packageName: string;
  monthlyPrice: number;
  depositAmount: number;
  allowedDurations: number[];
  isActive: boolean;
  city?: string;
  description?: string;
  items: PackageItem[];
}

/* ================= FORM ================= */

interface PackageFormProps {
  value: any;
  products: any[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function PackageForm({
  value,
  products,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  isLoading,
}: PackageFormProps) {
  const addItem = () =>
    onChange({
      target: {
        name: "items",
        value: [...value.items, { product: "", quantity: 1 }],
      },
    } as any);

  const updateItem = (idx: number, field: string, val: any) => {
    const updated = [...value.items];
    updated[idx][field] = val;
    onChange({ target: { name: "items", value: updated } } as any);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <input
        className="w-full px-4 py-2 border border-white/30 bg-white/50 rounded-xl backdrop-blur-xl text-sm placeholder:text-slate-400 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
        placeholder="Package Name"
        value={value.packageName || ""}
        onChange={onChange}
        name="packageName"
        required
      />

      <textarea
        className="w-full px-4 py-2 border border-white/30 bg-white/50 rounded-xl backdrop-blur-xl text-sm placeholder:text-slate-400 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
        placeholder="Description"
        value={value.description || ""}
        onChange={onChange}
        name="description"
        rows={3}
      />

      <input
        className="w-full px-4 py-2 border border-white/30 bg-white/50 rounded-xl backdrop-blur-xl text-sm placeholder:text-slate-400 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
        placeholder="City"
        value={value.city || ""}
        onChange={onChange}
        name="city"
      />

      <input
        type="number"
        className="w-full px-4 py-2 border border-white/30 bg-white/50 rounded-xl backdrop-blur-xl text-sm placeholder:text-slate-400 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
        placeholder="Monthly Price"
        value={value.monthlyPrice || ""}
        onChange={onChange}
        name="monthlyPrice"
        required
      />

      <input
        type="number"
        className="w-full px-4 py-2 border border-white/30 bg-white/50 rounded-xl backdrop-blur-xl text-sm placeholder:text-slate-400 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
        placeholder="Deposit Amount"
        value={value.depositAmount || ""}
        onChange={onChange}
        name="depositAmount"
      />

      <div>
        <label className="text-sm font-medium text-slate-700">
          Allowed Durations
        </label>
        <div className="flex gap-4 mt-2">
          {[3, 6, 12].map((m) => (
            <label key={m} className="flex gap-1 items-center text-sm">
              <input
                type="checkbox"
                checked={value.allowedDurations?.includes(m) || false}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...(value.allowedDurations || []), m]
                    : (value.allowedDurations || []).filter(
                      (x: number) => x !== m
                    );
                  onChange({
                    target: { name: "allowedDurations", value: next },
                  } as any);
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{m} Months</span>
            </label>
          ))}
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <div>
        <label className="font-medium text-slate-900">
          Products in Package
        </label>
        {value.items?.map((it: any, idx: number) => (
          <div key={idx} className="flex gap-2 mt-2">
            <select
              className="w-full px-4 py-2 border border-white/30 bg-white/50 rounded-xl flex-1 text-sm backdrop-blur-xl focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
              value={it.product}
              onChange={(e) => updateItem(idx, "product", e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((p: any) => (
                <option key={p._id} value={p._id}>
                  {p.productName}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              className="w-24 px-4 py-2 border border-white/30 bg-white/50 rounded-xl text-sm backdrop-blur-xl focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40"
              value={it.quantity}
              onChange={(e) =>
                updateItem(idx, "quantity", Number(e.target.value))
              }
            />
          </div>
        ))}
        <Button className="mt-2" variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Package"
          )}
        </Button>
      </div>
    </form>
  );
}

/* ================= MAIN ================= */

export default function PackageTable() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const emptyForm = {
    packageName: "",
    monthlyPrice: "",
    depositAmount: "",
    allowedDurations: [3, 6, 12],
    items: [],
    description: "",
    city: "",
    packageImage: null,
  };

  const [form, setForm] = useState<any>(emptyForm);

  const packagesPerPage = 10;

  /* ================= QUERIES ================= */

  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: packageService.getAllPackages,
    select: (data) => data.data || [],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["productList"],
    queryFn: productService.getProductList,
    select: (data) => data.data || [],
  });

  /* ================= MUTATIONS ================= */

  const createPackageMutation = useMutation({
    mutationFn: packageService.createPackage,
    onSuccess: () => {
      toast.success("Package created successfully");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create package");
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      packageService.updatePackage(id, data),
    onSuccess: () => {
      toast.success("Package updated successfully");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update package");
    },
  });

  const togglePackageMutation = useMutation({
    mutationFn: packageService.togglePackageStatus,
    onSuccess: () => {
      toast.success("Package status updated");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: packageService.deletePackage,
    onSuccess: () => {
      toast.success("Package deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      closeConfirm();
    },
    onError: (err: any) => {
      console.error("Delete failed:", err);
      toast.error("Failed to delete package");
    },
  });

  /* ================= FILTERS ================= */

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filtered = packages.filter((pkg: Package) => {
    const searchMatch = pkg.packageName
      .toLowerCase()
      .includes(search.toLowerCase());
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && pkg.isActive) ||
      (statusFilter === "inactive" && !pkg.isActive);
    return searchMatch && statusMatch;
  });

  const indexOfLast = currentPage * packagesPerPage;
  const indexOfFirst = indexOfLast - packagesPerPage;
  const current = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / packagesPerPage) || 1;

  const statusLabelMap: Record<string, string> = {
    all: "All Status",
    active: "Active",
    inactive: "Inactive",
  };

  /* ================= HELPERS ================= */

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const savePackage = () => {
    const fd = new FormData();
    Object.entries({
      packageName: form.packageName,
      monthlyPrice: form.monthlyPrice,
      depositAmount: form.depositAmount || 0,
      description: form.description || "",
      city: form.city || "",
    }).forEach(([k, v]) => fd.append(k, String(v)));

    fd.append("items", JSON.stringify(form.items));
    fd.append("allowedDurations", JSON.stringify(form.allowedDurations));

    if (form.packageImage) {
      fd.append("packageImage", form.packageImage);
    }

    if (editId) {
      updatePackageMutation.mutate({ id: editId, data: fd });
    } else {
      createPackageMutation.mutate(fd);
    }
  };

  const openConfirm = (id: string) => {
    setConfirmId(id);
  };

  const closeConfirm = () => {
    if (deletePackageMutation.isPending) return;
    setConfirmId(null);
  };

  const handleConfirmDelete = () => {
    if (!confirmId) return;
    deletePackageMutation.mutate(confirmId);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: any) => ({
      ...prev,
      packageImage: e.target.files?.[0] || null,
    }));
  };

  const editPackage = (p: Package) => {
    setEditId(p._id);
    setForm({
      packageName: p.packageName,
      monthlyPrice: p.monthlyPrice,
      depositAmount: p.depositAmount,
      allowedDurations: p.allowedDurations,
      items: p.items.map((item: PackageItem) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      description: p.description || "",
      city: p.city || "",
      packageImage: null,
    });
    setModalOpen(true);
  };

  /* ================= UI ================= */

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl bg-gradient-to-br from-[#F24E6C]/25 via-[#FF6F8C]/20 to-transparent dark:from-blue-600/30 dark:via-purple-600/30 dark:to-transparent" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full blur-3xl bg-gradient-to-tr from-black/20 via-black/10 to-transparent dark:from-emerald-500/25 dark:via-cyan-500/25 dark:to-transparent" />

      <div className="relative">
        {/* Header with Search + Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Packages
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage packages, filter by status.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
                ⌕
              </span>
              <input
                type="text"
                placeholder="Search packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none ring-0 backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/40 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                className="dropdown-toggle flex items-center gap-2 rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none backdrop-blur-xl transition hover:bg-white/80 focus:ring-2 focus:ring-indigo-500/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/90"
              >
                <span>{statusLabelMap[statusFilter]}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              <Dropdown
                isOpen={isStatusDropdownOpen}
                onClose={() => setIsStatusDropdownOpen(false)}
                className="w-44"
              >
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("all");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  All Status
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("active");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Active
                </DropdownItem>
                <DropdownItem
                  onItemClick={() => {
                    setStatusFilter("inactive");
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  Inactive
                </DropdownItem>
              </Dropdown>
            </div>

            {/* Add Button */}
            <Button
              onClick={() => {
                setForm(emptyForm);
                setEditId(null);
                setModalOpen(true);
              }}
              className="px-4 py-1.5 text-xs font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Package
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Monthly
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Deposit
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Durations
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-semibold">
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center font-semibold"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {packagesLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
                  >
                    Loading packages...
                  </TableCell>
                </TableRow>
              ) : current.length > 0 ? (
                current.map((pkg: Package) => (
                  <TableRow
                    key={pkg._id}
                    className="group border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)]"
                  >
                    <TableCell className="px-4 py-4 text-sm text-slate-900 dark:text-slate-50">
                      {pkg.packageName}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-800 dark:text-slate-200">
                      ₹{pkg.monthlyPrice}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center text-sm text-slate-800 dark:text-slate-200">
                      ₹{pkg.depositAmount}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {pkg.allowedDurations.join(", ")} months
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${pkg.isActive
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                          : "bg-amber-500/10 text-amber-400 ring-amber-500/40 shadow-[0_0_0_1px_rgba(245,158,11,0.35)]"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-emerald-400" : "bg-amber-400"
                            }`}
                        />
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editPackage(pkg)}
                          className="px-3 py-1 text-xs"
                          disabled={
                            togglePackageMutation.isPending ||
                            deletePackageMutation.isPending
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePackageMutation.mutate(pkg._id)}
                          className="px-3 py-1 text-xs min-w-[80px]"
                          disabled={
                            togglePackageMutation.isPending ||
                            deletePackageMutation.isPending
                          }
                        >
                          {togglePackageMutation.isPending &&
                            togglePackageMutation.variables === pkg._id ? (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </span>
                          ) : pkg.isActive ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </Button>
                        <button
                          onClick={() => openConfirm(pkg._id)}
                          disabled={
                            togglePackageMutation.isPending ||
                            deletePackageMutation.isPending
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-rose-500 hover:shadow-[0_10px_25px_rgba(248,113,113,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/70 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-0">
                  <td
                    colSpan={6}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No packages found. Try adjusting your filters or search.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {Array.isArray(filtered) && filtered.length > 0 && (
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

        {/* Edit/Create Modal */}
        <ModalWrapper isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h3 className="text-lg font-semibold mb-3">
            {editId ? "Edit Package" : "Create Package"}
          </h3>
          <PackageForm
            value={form}
            products={products}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={savePackage}
            onCancel={() => setModalOpen(false)}
            isLoading={
              createPackageMutation.isPending || updatePackageMutation.isPending
            }
          />
        </ModalWrapper>

        {/* Delete confirm modal */}
        <ModalWrapper isOpen={!!confirmId} onClose={closeConfirm}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Delete package?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This action cannot be undone. Are you sure you want to permanently
            delete this package?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={closeConfirm}
              disabled={deletePackageMutation.isPending}
            >
              No, keep
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={deletePackageMutation.isPending}
            >
              {deletePackageMutation.isPending ? "Deleting..." : "Yes, delete"}
            </Button>
          </div>
        </ModalWrapper>
      </div>
    </div>
  );
}
