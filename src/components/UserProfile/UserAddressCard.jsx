import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/button/Button";

// --- Clean, Sharp Icons ---
const FileIcon = () => (
  <svg
    className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const CopyIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// --- Sub-Component: File Tile ---
const FileTile = ({ label, fileName }) => {
  const hasFile = fileName && fileName !== "N/A";

  if (!hasFile) return null;

  return (
    <div className="group flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer text-center h-28">
      <div className="mb-2">
        <FileIcon />
      </div>
      <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 line-clamp-2 px-1">
        {fileName}
      </span>
      <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

// --- Main Component ---
export default function UserAddressCard({ userData }) {
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState(null);

  if (!userData) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hasFiles = [1, 2, 3, 4, 5].some(
    (i) => userData[`file${i}`] && userData[`file${i}`] !== "N/A"
  );

  return (
    <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* --- LEFT PANEL: Identity & Actions --- */}
      <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">
            Customer Profile
          </h3>

          <div className="mb-6">
            <p className="text-xs text-gray-500 mb-1">Customer Number</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {userData.customer_no || "--"}
              </span>
              <button
                onClick={() => handleCopy(userData.customer_no, "cust")}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                {copiedField === "cust" ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {/* Payment Term Tag */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 font-medium">
                Payment Term
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {userData.payment_term
                  ? `${userData.payment_term} Days`
                  : "N/A"}
              </span>
            </div>

            {/* Verification Status Tag */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg border 
              ${
                userData.email_verified_at
                  ? "bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800"
                  : "bg-yellow-50 border-yellow-100"
              }`}
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Status
              </span>
              <span
                className={`text-sm font-bold ${
                  userData.email_verified_at
                    ? "text-green-700 dark:text-green-400"
                    : "text-yellow-700"
                }`}
              >
                {userData.email_verified_at ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={() => navigate("/user/profile/edit")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2"
          >
            <EditIcon />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* --- RIGHT PANEL: Details & Data --- */}
      <div className="w-full md:w-2/3 p-6 md:p-8 bg-white dark:bg-gray-900">
        {/* Section 1: Information */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              General Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="relative group">
              <label className="text-xs text-gray-400 font-semibold uppercase mb-1 block">
                Billing Address
              </label>
              <div className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                {userData.address || "No address on file."}
              </div>
              {userData.address && (
                <button
                  onClick={() => handleCopy(userData.address, "addr")}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-600"
                >
                  {copiedField === "addr" ? <CheckIcon /> : <CopyIcon />}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase mb-1 block">
                  Admin Reference
                </label>
                <p className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                  {userData.admin_id || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase mb-1 block">
                  Last Update
                </label>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Files Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              Documents
            </h4>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full dark:bg-gray-800 dark:text-gray-400">
              {hasFiles ? "Attached" : "Empty"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hasFiles ? (
              [1, 2, 3, 4, 5].map((idx) => (
                <FileTile
                  key={idx}
                  label={`Slot ${idx}`}
                  fileName={userData[`file${idx}`]}
                />
              ))
            ) : (
              <div className="col-span-full py-6 text-center text-sm text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                No documents attached to this profile.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
