import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { DateRangePicker } from "../../components/common/DateRangePicker";
import { listResource, reportsAPI } from "../../services/api";
import { Download, Users, Calendar, FileText, CheckSquare } from "lucide-react";

const RESOURCE_OPTIONS = [
  { value: "invoices", label: "Invoices" },
  { value: "deliveryorders", label: "Delivery Orders" },
  { value: "creditnotes", label: "Credit Notes" },
  { value: "debitnotes", label: "Debit Notes" },
  { value: "statements", label: "Statements" }, // Shortened label for space
  { value: "payments", label: "Payments" }, // Shortened label
  { value: "customers", label: "Customers" },
];

export default function ExportReport() {
  const [resource, setResource] = useState(RESOURCE_OPTIONS[0]?.value || "");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await listResource("customers", { perPage: 500 });
        const options = (res.rows || []).map((row) => ({
          value: row.id,
          label:
            row.company_name ||
            row.user?.company ||
            row.customer_no ||
            "Unknown",
        }));
        setUsers(options);
      } catch (error) {
        setToast({
          message: error.message || "Failed to load users",
          type: "error",
        });
      }
    };

    loadUsers();
  }, []);

  const userLookup = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.value, u.label));
    return map;
  }, [users]);

  const handleToggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.value));
    }
  };

  const handleDateChange = (type, value) => {
    if (type === "from") {
      setDateFrom(value);
    } else if (type === "to") {
      setDateTo(value);
    } else if (type === "clear") {
      setDateFrom("");
      setDateTo("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resource) {
      setToast({ message: "Select a page to export", type: "error" });
      return;
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setToast({
        message: "Start date must be before end date",
        type: "error",
      });
      return;
    }

    try {
      setIsLoading(true);
      setToast({ message: null, type: "success" });
      const payload = {
        resource,
        user_ids: selectedUsers,
        date_from: dateFrom || null,
        date_to: dateTo || null,
      };
      const blob = await reportsAPI.export(payload);
      const filename = `report-${resource}.zip`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      setToast({ message: "Report export started", type: "success" });
    } catch (error) {
      setToast({
        message: error.message || "Failed to export report",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container set to fixed height relative to viewport to prevent page scroll
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "success" })}
        />
      )}
      <PageMeta
        title="Export Reports"
        description="Generate and download data reports."
      />

      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-4 overflow-hidden flex flex-col">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Export Manager
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure parameters to download your report archive.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0"
        >
          {/* LEFT COLUMN: Controls (Fixed, non-scrollable) */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
            {/* 1. Resource Type */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                Report Type
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {RESOURCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setResource(option.value)}
                    className={`px-3 py-2 rounded-md text-xs font-medium text-left transition-all duration-200 border ${
                      resource === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Date Range */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" />
                Time Period{" "}
                <span className="text-xs font-normal text-gray-500">
                  (Optional)
                </span>
              </h2>
              <DateRangePicker
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateChange={handleDateChange}
              />
            </div>

            {/* Submit Button (Pushed to bottom of left col or just inline) */}
            <div className="mt-auto pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 py-3 text-sm font-bold text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Download size={18} />
                    Download Report Archive
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Users (Takes remaining height, Scrollable) */}
          <div className="lg:col-span-8 flex flex-col bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full">
            {/* User List Header */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Target Users
                <span className="text-xs font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {users.length} total
                </span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {selectedUsers.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllUsers}
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <CheckSquare size={14} />
                  {selectedUsers.length === users.length
                    ? "Clear All"
                    : "Select All"}
                </button>
              </div>
            </div>

            {/* Scrollable User List Area */}
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {users.length === 0 ? (
                  <div className="col-span-full h-40 flex flex-col items-center justify-center text-gray-400">
                    <Users size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <label
                      key={user.value}
                      className={`flex items-start gap-3 p-2 rounded border transition-all cursor-pointer ${
                        selectedUsers.includes(user.value)
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.value)}
                        onChange={() => handleToggleUser(user.value)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-offset-0 focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-medium truncate ${
                            selectedUsers.includes(user.value)
                              ? "text-blue-800 dark:text-blue-200"
                              : "text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {user.label}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          ID: {user.value}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
