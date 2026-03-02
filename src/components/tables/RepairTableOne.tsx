import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { repairService } from "../../services/repairService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import ModalWrapper from "../../layout/ModalWrapper";
import { useSidebar } from "../../context/SidebarContext";

interface RepairProduct {
  _id: string;
  returnId: string;
  productId: string;
  issueReported: string;
  actionTaken: string;
  partsRequired: string;
  estimatedCost: string;
  completionDate: string;
  comments: string;
  priority: string;
  status: string;
  postedBy: string;
}

const itemsPerPage = 10;

const RepairTableOne: React.FC = () => {
  const { isExpanded } = useSidebar();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState<{
    open: boolean;
    type: "" | "add" | "edit" | "delete";
    product: RepairProduct | null;
  }>({ open: false, type: "", product: null });

  const [formProduct, setFormProduct] = useState<any>({});

  const { data: repairProducts = [], isLoading } = useQuery({
    queryKey: ["repairProducts"],
    queryFn: repairService.getRepairProducts,
    select: (data) => data.message || [],
  });

  const createRepairMutation = useMutation({
    mutationFn: repairService.createRepair,
    onSuccess: () => {
      toast.success("Repair product added");
      queryClient.invalidateQueries({ queryKey: ["repairProducts"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to add repair product");
    },
  });

  const updateRepairMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      repairService.updateRepair(id, data),
    onSuccess: () => {
      toast.success("Repair updated");
      queryClient.invalidateQueries({ queryKey: ["repairProducts"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to update repair product");
    },
  });

  const deleteRepairMutation = useMutation({
    mutationFn: repairService.deleteRepair,
    onSuccess: () => {
      toast.success("Repair product deleted");
      queryClient.invalidateQueries({ queryKey: ["repairProducts"] });
      closeModal();
    },
    onError: () => {
      toast.error("Failed to delete repair product");
    },
  });

  const filtered = repairProducts.filter((p: RepairProduct) => {
    const matchesSearch =
      !search ||
      [p.returnId, p.productId, p.issueReported].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus =
      !statusFilter || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPageData = filtered.slice(indexOfFirst, indexOfLast);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const openAddModal = () => {
    setFormProduct({});
    setModal({ open: true, type: "add", product: null });
  };
  const openEditModal = (product: RepairProduct) => {
    setFormProduct(product);
    setModal({ open: true, type: "edit", product });
  };
  const openDeleteModal = (product: RepairProduct) => {
    setModal({ open: true, type: "delete", product });
  };
  const closeModal = () => {
    setModal({ open: false, type: "", product: null });
    setFormProduct({});
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormProduct((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRepairMutation.mutate(formProduct);
  };

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.product) return;
    updateRepairMutation.mutate({ id: modal.product._id, data: formProduct });
  };

  const handleDeleteProduct = () => {
    if (!modal.product) return;
    deleteRepairMutation.mutate(modal.product._id);
  };


  return (
    <>
      <div
        className={`rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] transition-[max-width] duration-300 ease-in-out p-5 flex flex-col ${isExpanded ? "max-w-40% xl:max-w-235 axl:max-w-250 bxl:max-w-263 cxl:max-w-280" : "max-w-340 xl:max-w-280 axl:max-w-300 cxl:max-w-330 2xl:max-w-320"
          }`}
      >
        {/* Controls Row (never scrolls in X) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 overflow-x-auto scrollbar-hide table-scrollbar">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Repair Products
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={openAddModal}
              className="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
            >
              <Plus className="w-5 h-5" /> Add Repair
            </Button>

            <input
              type="text"
              placeholder="Search Repairs..."
              className="w-full sm:w-64 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white/80 dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 dark:text-white"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="w-full sm:w-48 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        {/* ONLY TABLE SCROLLS HORIZONTALLY */}
        <div className="max-w-full overflow-x-auto rounded-lg table-scrollbar">
          <div className="min-w-max">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.03]">
                <TableRow>
                  {[
                    ["Return ID", 120],
                    ["Product ID", 120],
                    ["Issue Reported", 150],
                    ["Action Taken", 150],
                    ["Parts Required", 130],
                    ["Estimated Cost", 130],
                    ["Completion Date", 140],
                    ["Comments", 150],
                    ["Priority", 100],
                    ["Status", 120],
                    ["Actions", 100],
                  ].map(([label, width]) => (
                    <TableCell
                      key={label}
                      isHeader
                      className={`px-5 py-3 dark:text-white text-gray-dark min-w-[${width}px] ${label === "Actions" ? "text-center" : ""
                        }`}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-6 text-gray-500 dark:text-gray-400"
                    >
                      Loading repair products...
                    </TableCell>
                  </TableRow>
                ) : currentPageData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No repair products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPageData.map((prod: RepairProduct) => (
                    <TableRow key={prod._id}>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.returnId}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.productId}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.issueReported}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.actionTaken}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.partsRequired}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.estimatedCost}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.completionDate
                          ? new Date(prod.completionDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.comments}
                      </TableCell>
                      <TableCell className="px-5 py-4 dark:text-white">
                        {prod.priority}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            prod.status
                          )}`}
                        >
                          {prod.status}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-4 text-center">
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
                          onClick={() => openEditModal(prod)}
                        >
                          <Pencil className="w-5 h-5 text-gray-700 dark:text-white" />
                        </button>
                        <button
                          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 text-red-600"
                          onClick={() => openDeleteModal(prod)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border dark:text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border dark:text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <ModalWrapper
        isOpen={modal.open && modal.type === "add"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Add Repair
        </h3>

        <form
          onSubmit={handleAddProductSubmit}
          className="space-y-4 max-w-xl mx-auto"
        >
          <label>
            <span className="block text-sm font-medium mb-1">Return ID</span>
            <input
              name="returnId"
              value={formProduct.returnId || ""}
              onChange={handleFormChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </label>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add
            </Button>
          </div>
        </form>
      </ModalWrapper>

      {/* Edit Modal */}
      <ModalWrapper
        isOpen={modal.open && modal.type === "edit"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
          Edit Repair
        </h3>

        <form
          onSubmit={handleEditProductSubmit}
          className="space-y-4 max-w-xl mx-auto"
        >
          <label>
            <span className="block text-sm font-medium mb-1">Return ID</span>
            <input
              name="returnId"
              value={formProduct.returnId || ""}
              onChange={handleFormChange}
              required
              className="w-full rounded border px-3 py-2"
            />
          </label>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </ModalWrapper>

      {/* Delete Modal */}
      <ModalWrapper
        isOpen={modal.open && modal.type === "delete"}
        onClose={closeModal}
      >
        <h3 className="text-lg font-semibold mb-3 text-red-600">
          Delete Repair
        </h3>
        <p>Are you sure you want to delete repair {modal.product?.returnId}?</p>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Delete
          </Button>
        </div>
      </ModalWrapper>
    </>
  );
};

export default RepairTableOne;
