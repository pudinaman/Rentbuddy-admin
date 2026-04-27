import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "react-toastify";
import { Pagination } from "../ui/pagination/Pagination";
import { Eye, FileCheck, ShoppingBag } from "lucide-react";
import ModalWrapper from "../../layout/ModalWrapper";

const itemsPerPage = 10;

const DocumentTableOne = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [orderDocTarget, setOrderDocTarget] = useState<any | null>(null);

  /* ================= QUERIES ================= */
  // Fetch all orders to extract document-specific ones
  const { data: orderData, isLoading: isOrderLoading } = useQuery({
    queryKey: ["orders-for-docs", currentPage],
    queryFn: () => orderService.getOrders({ page: 1, limit: 1000 }), // Fetch a large batch to filter
  });

  const allOrders = orderData?.data || [];
  const ordersWithDocs = allOrders.filter((o: any) => o.documents && Object.values(o.documents).some((d: any) => d.url));

  /* ================= MUTATIONS ================= */
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderDocStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Order documents marked as ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["orders-for-docs"] });
      setOrderDocTarget(null);
    },
  });

  /* ================= HELPERS ================= */
  const isPDF = (url: string) =>
    url.includes("/raw/") || url.toLowerCase().endsWith(".pdf");

  const renderPreview = (url: string) => {
    if (isPDF(url)) {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
      return <iframe src={viewerUrl} className="w-full h-[65vh] rounded-lg border" frameBorder="0" />;
    }
    return <img src={url} alt="Document" className="w-full rounded-lg" />;
  };

  /* ================= FILTER + PAGINATION ================= */
  const filteredOrders = ordersWithDocs.filter((o: any) => 
    o.orderId.toLowerCase().includes(search.toLowerCase()) || 
    (o.userId?.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.billingInfo?.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.billingInfo?.lastName || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.billingInfo?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedList = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const StatusBadge = ({ status }: { status: string }) => {
    const map: any = {
      pending: "bg-yellow-100 text-yellow-700",
      verified: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${map[status || 'pending']}`}>
        {status || 'PENDING'}
      </span>
    );
  };

  return (
    <Fragment>
      <div className="rounded-2xl border border-white/10 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-900/80">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="text-blue-500" />
              Document Center
            </h2>
            <p className="text-xs text-slate-500">Manage order-specific legal documents and rental agreements.</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">⌕</span>
            <input
              type="text"
              placeholder="Search Order ID, Customer Name or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          {isOrderLoading ? (
            <div className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Documents...</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow>
                  <TableCell isHeader>Order & Customer</TableCell>
                  <TableCell isHeader className="text-center">Aadhar</TableCell>
                  <TableCell isHeader className="text-center">PAN</TableCell>
                  <TableCell isHeader className="text-center">Agreement</TableCell>
                  <TableCell isHeader className="text-center">Status</TableCell>
                  <TableCell isHeader className="text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedList.length > 0 ? (
                  paginatedList.map((item: any) => (
                    <TableRow key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">#{item.orderId}</span>
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                            {item.userId?.username || `${item.billingInfo?.firstName || ''} ${item.billingInfo?.lastName || ''}`.trim() || 'Guest Customer'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.userId?.email || item.billingInfo?.email || 'No Email'}
                          </span>
                        </div>
                      </TableCell>

                      {["aadhar", "pan", "rentAgreement"].map((key) => (
                        <TableCell key={key} className="text-center">
                          {item.documents?.[key]?.url ? (
                            <button
                              onClick={() => setPreview(item.documents[key].url)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Eye size={16} />
                            </button>
                          ) : <span className="text-slate-300 italic text-xs">—</span>}
                        </TableCell>
                      ))}

                      <TableCell className="text-center">
                        <StatusBadge status={item.documentStatus} />
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setOrderDocTarget(item)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase hover:bg-slate-800 transition-all shadow-md active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
                          >
                            Verify Order
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 italic text-sm">No documents found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold text-slate-700 dark:bg-slate-100/10 dark:text-slate-200">
                {currentPage}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                of {totalPages} pages ({filteredOrders.length} total)
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

      {/* GLOBAL PREVIEW MODAL */}
      <ModalWrapper isOpen={!!preview} onClose={() => setPreview(null)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Document Preview</h2>
          <button onClick={() => setPreview(null)} className="text-xs font-bold text-rose-500 hover:underline">Close Preview</button>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 border">
          {preview && renderPreview(preview)}
        </div>
      </ModalWrapper>

      {/* ORDER VERIFICATION MODAL */}
      <ModalWrapper isOpen={!!orderDocTarget} onClose={() => setOrderDocTarget(null)}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verify Order Documents</h2>
          <StatusBadge status={orderDocTarget?.documentStatus} />
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-6 dark:bg-blue-900/20 dark:border-blue-800">
           <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Customer</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                   {orderDocTarget?.userId?.username || `${orderDocTarget?.billingInfo?.firstName || ''} ${orderDocTarget?.billingInfo?.lastName || ''}`.trim() || 'Guest Customer'}
                </p>
                <p className="text-[10px] text-slate-500">{orderDocTarget?.userId?.email || orderDocTarget?.billingInfo?.email || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Order ID</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">#{orderDocTarget?.orderId}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {['aadhar', 'pan', 'rentAgreement', 'idProof'].map((key) => {
            const doc = orderDocTarget?.documents?.[key];
            return (
              <div key={key} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-slate-400">{key}</span>
                {doc?.url ? (
                  <button
                    onClick={() => setPreview(doc.url)}
                    className="flex items-center gap-2 text-blue-600 font-bold text-xs hover:underline"
                  >
                    <Eye size={16} /> View
                  </button>
                ) : <span className="text-[10px] italic text-slate-300">Not Uploaded</span>}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setOrderDocTarget(null)}
            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => updateOrderStatusMutation.mutate({ id: orderDocTarget._id, status: "rejected" })}
            disabled={updateOrderStatusMutation.isPending || orderDocTarget?.documentStatus === "rejected"}
            className="px-6 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 shadow-lg active:scale-95 disabled:opacity-50"
          >
            Reject All
          </button>
          <button
            onClick={() => updateOrderStatusMutation.mutate({ id: orderDocTarget._id, status: "verified" })}
            disabled={updateOrderStatusMutation.isPending || orderDocTarget?.documentStatus === "verified"}
            className="px-6 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 shadow-lg active:scale-95 disabled:opacity-50"
          >
            Approve All
          </button>
        </div>
      </ModalWrapper>
    </Fragment>
  );
};

export default DocumentTableOne;
