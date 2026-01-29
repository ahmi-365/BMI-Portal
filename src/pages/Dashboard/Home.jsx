import { clsx } from "clsx";
import {
  Activity,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { DateRangePicker } from "../../components/common/DateRangePicker";
import MultiSelect from "../../components/common/MultiSelect";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { companiesAPI } from "../../services/api";

// Utility for cleaner tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Sub Components ---

const SkeletonCard = () => (
  <div className="rounded-2xl border border-gray-100 bg-white/50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
    <div className="flex items-start justify-between">
      <div className="space-y-3 w-full">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle, to }) => {
  const CardContent = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/20 bg-white p-6 shadow-sm transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        "dark:border-gray-800 dark:bg-gray-900/80 dark:backdrop-blur-xl",
        "group cursor-pointer"
      )}
    >
      <div
        className={cn(
          "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20",
          colorClass.replace("bg-", "bg-")
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="mb-1 text-3xl font-bold text-gray-800 dark:text-white">
            <CountUp end={value} duration={2} separator="," />
          </h3>
          {subtitle && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            </div>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3 shadow-sm transition-transform group-hover:scale-110",
            colorClass
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return to ? <Link to={to}>{CardContent}</Link> : CardContent;
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // UI State for "Show More"
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  useEffect(() => {
    // Refetch when filters change
    fetchDashboardData();
  }, [dateFrom, dateTo, selectedUserIds]);

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

  const handleUserChange = (newSelected) => {
    setSelectedUserIds(newSelected);
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await companiesAPI.list();
      const list = response?.data ?? response ?? [];
      const userOptions = Array.isArray(list)
        ? list.map((user) => ({
          value: user.id,
          label: user.company || user.name || user.email || `User ${user.id}`,
        }))
        : [];
      setUsers(userOptions);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const BASE_URL = import.meta.env.VITE_API_BASE;
      const token = localStorage.getItem("bmi_admin_token");

      // Build query params
      const params = new URLSearchParams();
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      selectedUserIds.forEach((id) => params.append("user_ids[]", id));

      const url = `${BASE_URL}/dashboard${params.toString() ? `?${params.toString()}` : ""
        }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper to render Selected Users List ---
  const renderSelectedUsers = () => {
    const VISIBLE_LIMIT = 3; // Number of items to show before truncating (approx 1 line)

    // Get all selected user labels
    const allSelectedNames = selectedUserIds
      .map((id) => users.find((u) => u.value === id)?.label)
      .filter(Boolean);

    if (allSelectedNames.length === 0) return null;

    // Calculate hidden count
    const hiddenCount = allSelectedNames.length - VISIBLE_LIMIT;

    // Determine which names to display
    const displayedNames = showAllUsers
      ? allSelectedNames
      : allSelectedNames.slice(0, VISIBLE_LIMIT);

    return (
      <span className="flex flex-wrap items-center gap-1">
        <strong>Users:</strong>{" "}
        <span>{displayedNames.join(", ")}</span>

        {/* Show "... & X others" if truncated */}
        {!showAllUsers && hiddenCount > 0 && (
          <span className="text-gray-500">
            {" "}& {hiddenCount} {hiddenCount === 1 ? "other" : "others"}
          </span>
        )}

        {/* Toggle Button */}
        {allSelectedNames.length > VISIBLE_LIMIT && (
          <button
            onClick={() => setShowAllUsers(!showAllUsers)}
            className="ml-1 rounded text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
          >
            {showAllUsers ? "Show Less" : "Show More"}
          </button>
        )}
      </span>
    );
  };

  /* -------------------- ERROR STATE -------------------- */
  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
          <Activity className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Failed to load data
        </h2>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Calculated Totals
  const totalDocuments =
    (dashboardData?.invoices || 0) +
    (dashboardData?.credit_notes || 0) +
    (dashboardData?.debit_notes || 0) +
    (dashboardData?.delivery_orders || 0);

  return (
    <>
      <PageMeta title="Admin Dashboard" />

      <div className="min-h-screen ">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Top Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <PageBreadcrumb
                items={[
                  { label: "Admin", href: "/admin" },
                  { label: "Dashboard", href: "/admin/dashboard" },
                ]}
              />
              <div className="mt-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Welcome back. Here's what's happening with your documents
                  today.
                </p>
              </div>
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200",
                "bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/80",
                "ring-1 ring-gray-900/10 dark:ring-white/10",
                "hover:shadow-md hover:ring-gray-900/20 dark:hover:ring-white/20",
                "active:scale-[0.98] active:shadow-sm",
                "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100",
                loading
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
              )}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  loading && "animate-spin text-blue-600 dark:text-blue-400",
                  !loading && "group-hover:rotate-180 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                )}
              />
              <span className="relative">
                {loading ? "Refreshing..." : "Refresh Data"}
              </span>

              {/* Subtle shine effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </button>
          </div>

          {/* Filters Section */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-end">
            {/* Wrapper for both inputs */}
            <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end">

              {/* Date Range: Keeps a consistent width on desktop, full width on mobile */}
              <div className="flex flex-col w-full lg:w-auto lg:min-w-[280px]">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                  Date Range:
                </label>
                <DateRangePicker
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDateChange={handleDateChange}
                />
              </div>

              {/* User Select: Takes up all remaining space (flex-1) to handle many tags */}
              <div className="flex flex-col w-full lg:flex-1 min-w-0">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                  Select Users:
                </label>
                <div className="w-full">
                  <MultiSelect
                    options={users}
                    value={selectedUserIds}
                    onChange={handleUserChange}
                    placeholder="Select users..."
                    disabled={usersLoading}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Preview */}
          {(dateFrom || dateTo || selectedUserIds.length > 0) && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <strong>Active Filters:</strong>
                </h3>
                <button
                  onClick={() => {
                    // Clear all filters
                    setDateFrom('');
                    setDateTo('');
                    setSelectedUserIds([]);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {dateFrom && dateTo && (
                  <span>
                    <strong>Date Range:</strong> {dateFrom} to {dateTo}
                  </span>
                )}
                {selectedUserIds.length > 0 && renderSelectedUsers()}
              </div>
            </div>
          )}

          {/* DOCUMENT SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
              <FileText className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Documents
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              ) : (
                <>
                  <StatCard
                    to="/invoices"
                    title="Invoices"
                    value={dashboardData?.invoices || 0}
                    icon={FileText}
                    colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
                    subtitle="View Invoices"
                  />
                  <StatCard
                    to="/creditnotes"
                    title="Credit Notes"
                    value={dashboardData?.credit_notes || 0}
                    icon={CreditCard}
                    colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
                    subtitle="View Credits"
                  />
                  <StatCard
                    to="/debitnotes"
                    title="Debit Notes"
                    value={dashboardData?.debit_notes || 0}
                    icon={FileText}
                    colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
                    subtitle="View Debits"
                  />

                  <StatCard
                    to="/deliveryorders"
                    title="Delivery Orders"
                    value={dashboardData?.delivery_orders || 0}
                    icon={Package}
                    colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
                    subtitle="View Orders"
                  />
                </>
              )}
            </div>
          </div>

          {/* FINANCIAL SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Financials
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
              ) : (
                <>
                  <StatCard
                    to="/payments"
                    title="Total Payments"
                    value={dashboardData?.["total-payments"] || 0}
                    icon={DollarSign}
                    colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
                    subtitle="Processed transactions"
                  />
                  <StatCard
                    to="/ppis"
                    title="PPI Credit Notes"
                    value={dashboardData?.ppi_cn || 0}
                    icon={CreditCard}
                    colorClass="bg-gradient-to-br from-pink-500 to-pink-600"
                    subtitle="PPI Adjustments"
                  />
                  <StatCard
                    to="/statements"
                    title="Statements"
                    value={dashboardData?.statements || 0}
                    icon={ClipboardList}
                    colorClass="bg-gradient-to-br from-teal-500 to-teal-600"
                    subtitle="Generated reports"
                  />
                </>
              )}
            </div>
          </div>

          {/* BOTTOM GRID: Customers & Summary */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Customer Status Column (Span 2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
                <Users className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Customer OPR
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {loading ? (
                  [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  <>
                    <StatCard
                      to="/customers"
                      title="Total"
                      value={dashboardData?.["total-customers"] || 0}
                      icon={Users}
                      colorClass="bg-blue-600"
                      subtitle="All customers"
                    />
                    <StatCard
                      to="/customers/approved"
                      title="Approved"
                      value={dashboardData?.["approved-customers"] || 0}
                      icon={UserCheck}
                      colorClass="bg-green-600"
                      subtitle="Verified accounts"
                    />
                    <StatCard
                      to="/customers/pending"
                      title="Pending"
                      value={dashboardData?.["pending-customers"] || 0}
                      icon={Clock}
                      colorClass="bg-yellow-500"
                      subtitle="Awaiting review"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Account Summary Card */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/50">
              <h3 className="mb-6 text-lg font-bold text-gray-800 dark:text-white">
                Quick Summary
              </h3>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      Total Documents
                    </span>
                    <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      <CountUp
                        end={totalDocuments}
                        duration={2}
                        separator=","
                      />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      Total Payments
                    </span>
                    <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      <CountUp
                        end={dashboardData?.["total-payments"] || 0}
                        duration={2}
                        separator=","
                      />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="h-2 w-2 rounded-full bg-teal-500" />
                      Total Statements
                    </span>
                    <span className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      <CountUp
                        end={dashboardData?.statements || 0}
                        duration={2}
                        separator=","
                      />
                    </span>
                  </div>

                  <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
                      <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        System Health
                      </p>
                      <p className="mt-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
                        Operational
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}