import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { downloadBlob } from "../../services/api";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const COLUMNS = [
  { header: "Customer No", accessor: "customer_no" },
  {
    header: "Company Name",
    accessor: "company_name",
    render: (row) => row.user?.company || row.company_name || "-",
  },
  {
    header: "Statement Doc",
    accessor: "statement_doc",
    render: (row) =>
      row.statement_doc ? (
        <button
          onClick={async () => {
            try {
              const blob = await downloadBlob(`/statements/download/${row.id}`);
              const blobUrl = URL.createObjectURL(blob);
              // Try to open in new tab; if blocked, fallback to triggering download
              const newWin = window.open(blobUrl, "_blank");
              if (!newWin) {
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = row.statement_doc || "statement.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
              }
              // Revoke object URL after a short delay to ensure it loaded
              setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
            } catch (err) {
              console.error("Download failed:", err);
              alert(
                "Failed to download statement. Please sign in or try again."
              );
            }
          }}
          className="text-brand-500 hover:underline"
        >
          {row.statement_doc}
        </button>
      ) : (
        "-"
      ),
  },
  { header: "Statement Date", accessor: "statement_date" },
  {
    header: "Updated At",
    accessor: "updated_at",
    render: (row) => row.updated_at || row.created_at || "-",
  },
  {
    header: "Uploaded By",
    accessor: "uploaded_by",
    render: (row) =>
      row.admin?.name || row.user?.name || row.uploaded_by || "-",
  },
];

export default function AccountStatementsView() {
  return (
    <ListPage
      resourceName="statements"
      columns={COLUMNS}
      title="Account Statements"
      addButtonText="New Account Statement"
    />
  );
}
