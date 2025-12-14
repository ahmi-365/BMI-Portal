import { useState } from "react";
import { useModal } from "../../hooks/useModal";
// Assuming you have a Toast component or you can use standard alert
import Toast from "../common/Toast"; 

// --- Icons (Inline) ---
const Icons = {
  User: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  Mail: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  Phone: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
  Building: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  Calendar: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  Copy: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
  Check: () => <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />,
};

// --- Helper Component: Interactive Data Field ---
const InfoItem = ({ label, value, icon, canCopy = false, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value || value === "N/A") return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    // Optional: Toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${className}`}>
      <div className="mt-1 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {value || "N/A"}
          </p>
          {canCopy && value && value !== "N/A" && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {copied ? <Icons.Check /> : <Icons.Copy />}
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function UserInfoCard({ userData }) {
  const { openModal } = useModal(); // Kept for future use

  if (!userData) return null;

  // Formatting dates safely
  const formatDate = (dateString) => 
    dateString ? new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A";

  return (
    <div className="p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
      
      {/* --- Header / Hero Section --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/20">
            {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {userData.name || "Unknown User"}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                ID: {userData.id ?? "N/A"}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                userData.status === 1 
                  ? "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30" 
                  : "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${userData.status === 1 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                {userData.status === 1 ? "Active Account" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Hidden button preserved from original code logic, but styled if you ever unhide it */}
        <button onClick={openModal} className="hidden px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Edit Details
        </button>
      </div>

      {/* --- Grid Layout for Details --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Group 1: Contact Information */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Contact Info</h5>
          <InfoItem icon={<Icons.Mail />} label="Primary Email" value={userData.email} canCopy />
          <InfoItem icon={<Icons.Mail />} label="Secondary Email" value={userData.email2} canCopy />
          <InfoItem icon={<Icons.Mail />} label="Tertiary Email" value={userData.email3} canCopy />
          <InfoItem icon={<Icons.Phone />} label="Phone Number" value={userData.phone} canCopy />
        </div>

        {/* Group 2: Business Details */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Business Details</h5>
          <InfoItem icon={<Icons.Building />} label="Company Name" value={userData.company} />
          <InfoItem icon={<Icons.Building />} label="Customer Number" value={userData.customer_no} canCopy />
          <InfoItem icon={<Icons.Copy />} label="Payment Term" value={userData.payment_term ? `${userData.payment_term} days` : "N/A"} />
          <InfoItem icon={<Icons.User />} label="Admin ID" value={userData.admin_id} canCopy />
        </div>

        {/* Group 3: System / Dates */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">System Data</h5>
          <InfoItem icon={<Icons.Copy />} label="Form Status" value={userData.form_status} />
          <InfoItem icon={<Icons.Calendar />} label="Created On" value={formatDate(userData.created_at)} />
          <InfoItem icon={<Icons.Calendar />} label="Last Updated" value={formatDate(userData.updated_at)} />
        </div>

      </div>
    </div>
  );
}