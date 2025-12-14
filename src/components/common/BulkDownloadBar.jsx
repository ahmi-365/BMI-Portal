import { Download, X } from "lucide-react";

export default function BulkDownloadBar({
  selectedCount = 0,
  onBulkDownload,
  onClear,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Download className="w-5 h-5" />
          <span className="text-sm font-medium">
            {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBulkDownload}
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onClear}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
