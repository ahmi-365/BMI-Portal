import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import { DateRangePicker } from "../../components/common/DateRangePicker";
import { listResource, reportsAPI } from "../../services/api";
import { Download, Users, Calendar } from "lucide-react";

const RESOURCE_OPTIONS = [
  { value: "invoices", label: "Invoices" },
  { value: "deliveryorders", label: "Delivery Orders" },
  { value: "creditnotes", label: "Credit Notes" },
  { value: "debitnotes", label: "Debit Notes" },
  { value: "statements", label: "Account Statements" },
  { value: "payments", label: "Payment Records" },
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
    <div className="space-y-6">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "success" })}
        />
      )}
      <PageMeta
        title="Export Reports - BMI Invoice Management System"
        description="Export data across invoices, delivery orders, notes, statements, and more."
      />

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Export Reports
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a page, date range, and users to generate and download
            reports
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Resource */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                1
              </span>
              Choose Report Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {RESOURCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setResource(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    resource === option.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <p
                    className={`font-medium text-sm ${
                      resource === option.value
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Date Range */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                2
              </span>
              Date Range (Optional)
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <Calendar
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Leave empty to export all records
              </p>
            </div>
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Step 3: Select Users */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                  3
                </span>
                Select Users
              </h2>
              <button
                type="button"
                onClick={handleSelectAllUsers}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {selectedUsers.length === users.length
                  ? "Clear All"
                  : "Select All"}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 space-y-2">
              {users.length === 0 ? (
                <div className="text-center py-6">
                  <Users
                    size={24}
                    className="text-gray-300 dark:text-gray-600 mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No users found
                  </p>
                </div>
              ) : (
                users.map((user) => (
                  <label
                    key={user.value}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.value)}
                      onChange={() => handleToggleUser(user.value)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">
                      {user.label}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedUsers.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Selected: {selectedUsers.length} user(s)
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 line-clamp-2">
                  {selectedUsers
                    .map((id) => userLookup.get(id))
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              {isLoading ? "Exporting..." : "Export Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
