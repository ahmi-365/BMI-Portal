import React from "react";
import { downloadBlob } from "../../services/api";

// Generic file download / open button used across list pages.
// Props:
// - file: filename (string)
// - id: resource id used to build download URL
// - endpoint: API endpoint base (e.g. 'invoices' or 'payments')
// - path: action path after endpoint (defaults to 'download')
// - children: optional label
export default function FileDownloadButton({ file, id, endpoint, path = "download", children }) {
  if (!file) return "-";

  const handleClick = async () => {
    try {
      const blob = await downloadBlob(`/${endpoint}/${path}/${id}`);
      const blobUrl = URL.createObjectURL(blob);

      const newWin = window.open(blobUrl, "_blank");
      if (!newWin) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = file || "file.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download document. Please try again.");
    }
  };

  return (
    <button onClick={handleClick} className="text-brand-500 hover:underline">
      {children || file}
    </button>
  );
}
