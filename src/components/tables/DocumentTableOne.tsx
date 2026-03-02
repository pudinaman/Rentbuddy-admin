import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "../../services/documentService";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { toast } from "react-toastify";
import { Pagination } from "../ui/pagination/Pagination";
import { Eye } from "lucide-react";
import ModalWrapper from "../../layout/ModalWrapper";

interface DocFile {
  url?: string;
  uploadedAt?: string;
}

interface DocumentType {
  _id: string;
  username: string;
  documents: {
    aadhar?: DocFile;
    pan?: DocFile;
    rentAgreement?: DocFile;
    idProof?: DocFile;
  };
  status: string;
}

const itemsPerPage = 10;

const DocumentTableOne = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents"],
    queryFn: documentService.getDocuments,
  });

  const docs: DocumentType[] = data?.documents || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      documentService.updateDocumentStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Marked as ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const updateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  /* ================= HELPERS ================= */
  const isPDF = (url: string) =>
    url.includes("/raw/") || url.toLowerCase().endsWith(".pdf");



  /* ================= PREVIEW RENDER ================= */
  const renderPreview = () => {
  if (!preview) return null;

  // 🔥 FORCE INLINE PDF VIEW
  if (isPDF(preview)) {
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      preview
    )}&embedded=true`;

    return (
      <iframe
        src={viewerUrl}
        className="w-full h-[65vh] rounded-lg border"
        frameBorder="0"
      />
    );
  }

  return (
    <img
      src={preview}
      alt="Document"
      className="w-full rounded-lg"
    />
  );
};


  /* ================= FILTER + PAGINATION ================= */
  const filtered = docs.filter(d =>
    d.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= STATUS BADGE ================= */
  const StatusBadge = ({ status }: { status: string }) => {
    const map: any = {
      pending: "bg-yellow-100 text-yellow-700",
      verified: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <Fragment>
      <div className="rounded-xl border bg-white p-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">Document Verification</h2>

          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border rounded-lg px-3 py-2"
          />
        </div>

        {/* Table */}
        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto pr-2">

          {isLoading && <p className="text-blue-600 text-center py-6">Loading...</p>}
          {isError && <p className="text-red-600 text-center py-6">{error?.message || "Failed to load documents"}</p>}

          {!isLoading && (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableCell isHeader>Username</TableCell>
                  <TableCell isHeader className="text-center">Aadhar</TableCell>
                  <TableCell isHeader className="text-center">PAN</TableCell>
                  <TableCell isHeader className="text-center">Rent Agreement</TableCell>
                  <TableCell isHeader className="text-center">Status</TableCell>
                  <TableCell isHeader className="text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {current.length > 0 ? (
                  current.map(d => (
                    <TableRow key={d._id}>
                      <TableCell className="font-medium">{d.username}</TableCell>

                      {["aadhar", "pan", "rentAgreement"].map((key: string) => (
                        <TableCell key={key} className="text-center">
                          {d.documents[key as keyof typeof d.documents]?.url ? (
                            <button
                              onClick={() =>
                                setPreview(
                                  d.documents[key as keyof typeof d.documents]?.url ?? null
                                )
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye size={20} />
                            </button>
                          ) : "—"}
                        </TableCell>
                      ))}

                      <TableCell className="text-center">
                        <StatusBadge status={d.status} />
                      </TableCell>

                      <TableCell className="text-center flex gap-2 justify-center py-3">
                        <button
                          disabled={d.status === "verified"}
                          onClick={() => updateStatus(d._id, "verified")}
                          className={`px-3 py-1 text-sm rounded-md text-white ${
                            d.status === "verified"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          Accept
                        </button>

                        <button
                          disabled={d.status === "rejected"}
                          onClick={() => updateStatus(d._id, "rejected")}
                          className={`px-3 py-1 text-sm rounded-md text-white ${
                            d.status === "rejected"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                        >
                          Reject
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex justify-between mt-4">
            <p className="text-sm">Page {currentPage} of {totalPages}</p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      <ModalWrapper isOpen={!!preview} onClose={() => setPreview(null)}>
        <h2 className="text-lg font-semibold mb-3">Uploaded Document</h2>

        <div className="w-full max-h-[65vh] overflow-auto rounded-lg border p-2 bg-gray-100">
          {renderPreview()}
        </div>

        <div className="flex justify-between mt-4">
          

          <button
            onClick={() => setPreview(null)}
            className="px-4 py-2 rounded-md bg-gray-700 text-white"
          >
            Close
          </button>
        </div>
      </ModalWrapper>
    </Fragment>
  );
};

export default DocumentTableOne;
