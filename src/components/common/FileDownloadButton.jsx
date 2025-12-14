import React from "react";
import { downloadBlob, userDownloadBlob } from "../../services/api";

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

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick(e);

    try {
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
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-brand-500 hover:underline focus:outline-none"
      title={`Download ${file}`}
    >
      {children || file}
    </button>
  );
}
