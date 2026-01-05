import React, { useState } from "react";
import { downloadBlob, userDownloadBlob } from "../../services/api";
import ConfirmationModal from "./ConfirmationModal";

export default function FileDownloadButton({
  file,
  id,
  endpoint,
  path = "download",
  children,
  isUserAPI = false,
  onClick,
}) {
  if (!file) return "-";

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const performDownload = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onClick) onClick(e);

    try {
      setIsDownloading(true);
      const downloadFn = isUserAPI ? userDownloadBlob : downloadBlob;
      const blob = await downloadFn(`/${endpoint}/${path}/${id}`);
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
    } finally {
      setIsDownloading(false);
      setIsConfirmOpen(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const needAcknowledgement = endpoint
    ? /invoices|ppis|ppi|payments|statements|deliveryorders|delivery-orders|debitnotes|debit-notes|creditnotes|credit-notes/.test(endpoint)
    : false;

  return (
    <>
      <button
        onClick={handleClick}
        className="text-brand-500 hover:underline focus:outline-none"
        title={`Download ${file}`}
      >
        {children || file}
      </button>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={performDownload}
        title="Download file"
        message={`Do you want to download ${file}?`}
        requireAcknowledgement={needAcknowledgement}
        confirmText={isDownloading ? "Downloading" : "Download"}
        cancelText="Cancel"
        isLoading={isDownloading}
      />
    </>
  );
}
