import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatchUpload } from "../../components/common/BatchUpload";
import { Upload } from "lucide-react";

export const BatchUploadPage = ({ resourceName, title }) => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = (files) => {
    setUploadedFiles(files);
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      setUploadedFiles([]);
      navigate(`/${resourceName}/view`);
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error uploading files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md2 font-bold text-black dark:text-white">
            Batch Upload - {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload multiple documents at once
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h3 className="font-medium text-black dark:text-white">
              Upload Files
            </h3>
          </div>

          <div className="p-6">
            <BatchUpload onFilesSelected={handleFilesSelected} maxFiles={10} />

            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(`/${resourceName}/view`)}
                className="flex justify-center rounded-lg border border-stroke px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || uploadedFiles.length === 0}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 font-medium text-gray-100 hover:bg-opacity-90 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploading
                  ? "Uploading..."
                  : `Upload ${uploadedFiles.length} File(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
