import React, { useState } from "react";
import { downloadBlob, userDownloadBlob } from "../../services/api";
import { toast } from "react-toastify";

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
      
      // Success toast
      toast.success("File downloaded successfully!");
      
    } catch (err) {
      console.error("Download failed:", err);

      let backendMessage = "";

      try {
        let errorData = err?.response?.data || err?.data;

        // If it's a Blob, convert to text first
        if (errorData instanceof Blob) {
          const text = await errorData.text();
          errorData = text;
        }

        // If it's a string, try to parse it as JSON
        if (typeof errorData === "string") {
          try {
            errorData = JSON.parse(errorData);
          } catch {
            // If parsing fails, check if the string itself contains the pattern
            const match = errorData.match(/"message"\s*:\s*"([^"]*)"/);
            if (match) {
              backendMessage = match[1];
            } else {
              backendMessage = errorData;
            }
          }
        }

        // Now extract message from the object
        if (typeof errorData === "object" && errorData !== null) {
          backendMessage = errorData.message || "";
        }

      } catch (e) {
        console.warn("Failed to parse backend error", e);
      }

      // Display error toast
      toast.error(backendMessage || "File missing on server");
      
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    performDownload(e);
  };

  return (
    <button
      onClick={handleClick}
      className="text-brand-500 hover:underline focus:outline-none"
      title={`Download ${file}`}
      disabled={isDownloading}
    >
      {isDownloading ? "Downloading..." : (children || file)}
    </button>
  );
}