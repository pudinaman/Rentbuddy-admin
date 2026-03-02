import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService } from "../../services/complaintService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import ModalWrapper from "../../layout/ModalWrapper";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface Complaint {
  _id: string;
  complaintId: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
}

const complaintsPerPage = 6;

export default function ComplaintTableOne() {
  const queryClient = useQueryClient();

  // const [complaints, setComplaints] = useState<Complaint[]>([]); // Removed local state
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmComplaint, setConfirmComplaint] = useState<Complaint | null>(null);
  const [editComplaint, setEditComplaint] = useState<Complaint | null>(null);
  const [formStatus, setFormStatus] = useState("");

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: complaintService.getAllComplaints,
    select: (data) => data.data || [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      complaintService.updateComplaintStatus(id, status),
    onSuccess: () => {
      toast.success("Complaint status updated");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setEditComplaint(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const deleteComplaintMutation = useMutation({
    mutationFn: complaintService.deleteComplaint,
    onSuccess: () => {
      toast.success("Complaint deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setConfirmComplaint(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete complaint");
    },
  });

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editComplaint) return;
    updateStatusMutation.mutate({
      id: editComplaint.complaintId,
      status: formStatus,
    });
  };

  const handleDeleteComplaint = () => {
    if (!confirmComplaint) return;
    deleteComplaintMutation.mutate(confirmComplaint.complaintId);
  };

  const indexOfLast = currentPage * complaintsPerPage;
  const indexOfFirst = indexOfLast - complaintsPerPage;
  const current = complaints.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(complaints.length / complaintsPerPage);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/15 to-transparent blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Complaints
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage customer complaints and their statuses.
          </p>
        </div>

        {/* Table */}
        <div className="max-w-full  overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="h-10 border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-xs uppercase tracking-[0.08em] text-slate-500 backdrop-blur-sm dark:border-white/10 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader>Complaint ID</TableCell>
                <TableCell isHeader>Date</TableCell>
                <TableCell isHeader>Name</TableCell>
                <TableCell isHeader>Email</TableCell>
                <TableCell isHeader>Phone</TableCell>
                <TableCell isHeader>Message</TableCell>
                <TableCell isHeader>Status</TableCell>
                <TableCell isHeader className="text-center">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="h-10 divide-y divide-white/10 dark:divide-white/10">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
                  >
                    Loading complaints...
                  </TableCell>
                </TableRow>
              ) : current.length > 0 ? (
                current.map((c: Complaint) => (
                  <TableRow
                    key={c._id}
                    className="group border-b border-white/5 last:border-0 hover:bg-white/60 hover:shadow-[0_10px_35px_rgba(15,23,42,0.25)] hover:backdrop-blur-2xl dark:border-white/5 dark:hover:bg-slate-900/80 dark:hover:shadow-[0_14px_45px_rgba(0,0,0,0.7)] transition-all duration-200"
                  >
                    <TableCell className="text-center">{c.complaintId}</TableCell>
                    <TableCell className="text-center">{formatDate(c.date)}</TableCell>
                    <TableCell className="text-center">{c.name}</TableCell>
                    <TableCell className="text-center">{c.email}</TableCell>
                    <TableCell className="text-center">{c.phone}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-center">
                      {c.message}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                          c.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40"
                            : c.status === "rejected"
                            ? "bg-rose-500/10 text-rose-400 ring-rose-500/40"
                            : "bg-amber-500/10 text-amber-400 ring-amber-500/40"
                        }`}
                      >
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditComplaint(c);
                            setFormStatus(c.status);
                          }}
                          className="rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmComplaint(c)}
                          className="rounded-lg p-1 text-rose-500 hover:bg-rose-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No complaints found.
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {complaints.length > 0 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/30 px-4 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            <p className="flex items-center gap-1">
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900/5 text-[11px] font-semibold">
                {currentPage}
              </span>
              <span className="uppercase tracking-[0.18em] text-slate-500">
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

        {/* Edit Modal */}
        <ModalWrapper isOpen={!!editComplaint} onClose={() => setEditComplaint(null)}>
          <h3 className="text-lg font-semibold">Edit Complaint Status</h3>
          <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditComplaint(null)}
                className="rounded-lg border px-4 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-white"
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </ModalWrapper>

        {/* Delete Modal */}
        <ModalWrapper
          isOpen={!!confirmComplaint}
          onClose={() => setConfirmComplaint(null)}
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Delete complaint?
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Complaint ID:{" "}
            <strong>{confirmComplaint?.complaintId}</strong>
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirmComplaint(null)}
              className="rounded-lg border px-4 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteComplaint}
              disabled={deleteComplaintMutation.isPending}
              className="rounded-lg bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 px-4 py-1.5 text-white"
            >
              {deleteComplaintMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </ModalWrapper>
      </div>
    </div>
  );
}
