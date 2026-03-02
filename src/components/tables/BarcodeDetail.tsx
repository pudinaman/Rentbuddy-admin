import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { barcodeService } from "../../services/barcodeService";
import { useParams, useNavigate } from "react-router";
import { AlertTriangle, Trash2, User, Mail } from "lucide-react";
import ModalWrapper from "../../layout/ModalWrapper";

/* ================= TYPES ================= */

type BarcodeStatus = "available" | "rented" | "damaged" | string;

interface RentalItem {
  productName: string;
  productSerialID: string;
}

interface Customer {
  username?: string;
  email?: string;
}

interface CurrentRental {
  customerID?: Customer;
}

interface Barcode {
  _id: string;
  brID: string;
  status: BarcodeStatus;
  rentalItem: RentalItem;
  currentRental?: CurrentRental | null;
}

/* ================= COMPONENT ================= */

export default function BarcodeDetail() {
  const { barcodeId } = useParams<{ barcodeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmDelete, setConfirmDelete] = useState(false);

  /* ================= FETCH ================= */

  const { data: barcodeData, isLoading, isError, error } = useQuery({
    queryKey: ["barcode", barcodeId],
    queryFn: () => barcodeService.getBarcodeById(barcodeId!),
    enabled: !!barcodeId,
  });

  const barcode: Barcode | null = barcodeData?.barcode || null;

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "damaged" | "available" | "return" }) => {
      if (action === "damaged") return barcodeService.markDamaged(id);
      if (action === "available") return barcodeService.markAvailable(id);
      return barcodeService.markReturn(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barcode", barcodeId] });
      queryClient.invalidateQueries({ queryKey: ["barcodes"] });
    },
    onError: (err: any) => {
      console.error("Action failed:", err);
      alert("Action failed. See console for details.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: barcodeService.deleteBarcode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barcodes"] });
      navigate(-1);
    },
    onError: (err: any) => {
      console.error("Delete failed:", err);
      alert("Delete failed. See console for details.");
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/30 p-6 text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
        Loading barcode details...
      </div>
    );
  }

  if (isError || !barcode) {
    return (
      <div className="rounded-2xl border border-white/10 bg-rose-50 p-6 text-sm text-rose-500 dark:bg-rose-950/20">
        {error?.message || "Barcode not found"}
      </div>
    );
  }

  /* ================= ACTIONS ================= */

  const markDamaged = () => {
    if (!barcodeId) return;
    updateStatusMutation.mutate({ id: barcodeId, action: "damaged" });
  };

  const markAvailable = () => {
    if (!barcodeId) return;
    updateStatusMutation.mutate({ id: barcodeId, action: "available" });
  };

  const deleteBarcode = () => {
    if (!barcodeId) return;
    deleteMutation.mutate(barcodeId);
  };

  const loadingAction = updateStatusMutation.isPending || deleteMutation.isPending;

  /* ================= UI ================= */

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold dark:text-white">
              Barcode Detail
            </h1>
            <p className="text-xs text-slate-500">
              Barcode ID: <span className="font-mono">{barcode.brID}</span>
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset
              ${
                barcode.status === "available"
                  ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/40"
                  : barcode.status === "rented"
                  ? "bg-amber-500/10 text-amber-400 ring-amber-500/40"
                  : "bg-rose-500/10 text-rose-400 ring-rose-500/40"
              }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {barcode.status}
          </span>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/40 p-6 backdrop-blur-xl dark:bg-slate-900/60">
              <h3 className="mb-4 text-lg font-semibold dark:text-white">
                Barcode Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Info label="Product" value={barcode.rentalItem.productName} />
                <Info
                  label="Serial Number"
                  value={barcode.rentalItem.productSerialID}
                />
                <Info label="Status" value={barcode.status} />
                <Info label="Barcode ID" value={barcode.brID} mono />
              </div>
            </div>

            {barcode.status === "rented" && barcode.currentRental && (
              <div className="rounded-2xl border border-white/10 bg-white/40 p-6 backdrop-blur-xl dark:bg-slate-900/60">
                <h3 className="mb-4 text-lg font-semibold">
                  Current Rental
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    {barcode.currentRental.customerID?.username}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {barcode.currentRental.customerID?.email}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/40 p-6 backdrop-blur-xl dark:bg-slate-900/60">
              <h3 className="mb-4 text-lg font-semibold dark:text-white">
                Actions
              </h3>

              <div className="flex flex-col gap-3">
                {barcode.status === "available" && (
                  <button
                    onClick={markDamaged}
                    disabled={loadingAction}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Mark as Damaged
                  </button>
                )}

                {(barcode.status === "rented" ||
                  barcode.status === "damaged") && (
                  <button
                    onClick={markAvailable}
                    disabled={loadingAction}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Mark as Available
                  </button>
                )}

                <button
                  onClick={() => setConfirmDelete(true)}
                  disabled={barcode.status === "rented"}
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Barcode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      <ModalWrapper
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <h3 className="text-lg font-semibold">Delete Barcode?</h3>
        <p className="mt-2 text-sm text-slate-500">
          This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setConfirmDelete(false)}
            className="rounded-lg px-3 py-1 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={deleteBarcode}
            className="rounded-lg bg-rose-600 px-4 py-1 text-sm text-white"
          >
            Delete
          </button>
        </div>
      </ModalWrapper>
    </>
  );
}

/* ================= INFO BLOCK ================= */

interface InfoProps {
  label: string;
  value: string;
  mono?: boolean;
}

function Info({ label, value, mono }: InfoProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm text-slate-900 dark:text-slate-100 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
