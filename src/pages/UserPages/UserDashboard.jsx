import { clsx } from "clsx";
import {
  Activity,
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  RefreshCw,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { DateRangePicker } from "../../components/common/DateRangePicker";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { userAuthAPI } from "../../services/api";

// Utility for cleaner tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Helper for Date Formatting (YYYY-MM-DD) ---
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [dateFrom, dateTo]);

  const handleDateChange = (type, value) => {
    if (type === "from") setDateFrom(value);
    else if (type === "to") setDateTo(value);
    else if (type === "clear") {
      setDateFrom("");
      setDateTo("");
      setActiveFilter("");
    }
    // Clear active filter pill style if manually changing date
    if (type !== "clear") setActiveFilter("");
  };

  // --- Quick Filter Logic ---
  const handleQuickFilter = (type) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case "today":
        break; // Start/End are today
      case "week":
        const day = today.getDay();
        // Calculate Monday (if day is 0 (Sunday), subtract 6, else subtract day - 1)
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        break;
    }

    setDateFrom(formatDate(start));
    setDateTo(formatDate(end));
    setActiveFilter(type);
  };
  // --------------------------

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const BASE_URL = import.meta.env.VITE_API_BASE;
      const token = localStorage.getItem("bmi_user_token");

      const params = new URLSearchParams();
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      const url = `${BASE_URL}/user/dashboard${params.toString() ? `?${params.toString()}` : ""
        }`;

      const [profileResponse, dashboardResponse] = await Promise.all([
        userAuthAPI.profile(),
        fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (profileResponse.status === "success") {
        setUserData(profileResponse.user);
      }

      if (!dashboardResponse.ok) {
        throw new Error(`HTTP error! status: ${dashboardResponse.status}`);
      }

      const data = await dashboardResponse.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

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

  const totalDocuments =
    (dashboardData?.invoices || 0) +
    (dashboardData?.credit_notes || 0) +
    (dashboardData?.debit_notes || 0) +
    (dashboardData?.delivery_orders || 0);

  // Quick Filter Button Component
  const FilterPill = ({ label, value }) => (
    <button
      onClick={() => handleQuickFilter(value)}
      className={cn(
        "px-3 py-2 text-xs font-medium rounded-lg transition-all border",
        activeFilter === value
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
      )}
    >
      {label}
    </button>
  );

  return (
    <>
      <PageMeta title="User Dashboard" />

      <div className="min-h-screen mt-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Top Header Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <PageBreadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Dashboard", href: "/user/dashboard" },
                ]}
              />
              <div className="mt-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Welcome back, {userData?.name || "User"}!
                </h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Here is an overview of your account activity today.
                </p>
              </div>
            </div>

            {/* <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="group flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 transition-transform",
                  loading && "animate-spin"
                )}
              />
              {loading ? "Refreshing..." : "Refresh Data"}
            </button> */}
          </div>

          {/* Filter Section - UI SAME AS BEFORE + QUICK FILTERS */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-end md:gap-4">
                <div className="flex flex-col min-w-[280px]">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                    Date Range:
                  </label>
                  <DateRangePicker
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateChange={handleDateChange}
                  />
                </div>

                {/* Quick Filters (Added here to sit next to picker on desktop, below on mobile) */}
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="Today" value="today" />
                  <FilterPill label="This Week" value="week" />
                  <FilterPill label="This Month" value="month" />
                  <FilterPill label="This Year" value="year" />
                </div>
              </div>

              {/* Active Filters Preview */}
              {(dateFrom || dateTo) && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {dateFrom && dateTo && (
                        <span>
                          <strong>Date Range:</strong> {dateFrom} to {dateTo}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                      }}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors whitespace-nowrap"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DOCUMENT SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
              <FileText className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Documents Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              ) : (
                <>
                  <StatCard
                    to="/user/invoices"
                    title="Invoices"
                    value={dashboardData?.invoices || 0}
                    icon={FileText}
                    colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
                    subtitle="View Invoices"
                  />
                  <StatCard
                    to="/user/credit-notes"
                    title="Credit Notes"
                    value={dashboardData?.credit_notes || 0}
                    icon={CreditCard}
                    colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
                    subtitle="View Credits"
                  />
                  <StatCard
                    to="/user/debit-notes"
                    title="Debit Notes"
                    value={dashboardData?.debit_notes || 0}
                    icon={FileText}
                    colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
                    subtitle="View Debits"
                  />
                  <StatCard
                    to="/user/delivery-orders"
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

          {/* FINANCIALS & SUMMARY GRID */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Financial Section (Span 2) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Financial Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {loading ? (
                  [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  <>
                    <StatCard
                      to="/user/payments"
                      title="Total Payments"
                      value={dashboardData?.payments || 0}
                      icon={DollarSign}
                      colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
                      subtitle="Processed transactions"
                    />
                    <StatCard
                      to="/user/ppi"
                      title="PPI Credit Notes"
                      value={dashboardData?.ppi_cn || 0}
                      icon={CreditCard}
                      colorClass="bg-gradient-to-br from-pink-500 to-pink-600"
                      subtitle="PPI Adjustments"
                    />
                    <div className="sm:col-span-2">
                      <StatCard
                        to="/user/statements"
                        title="Statements"
                        value={dashboardData?.statements || 0}
                        icon={ClipboardList}
                        colorClass="bg-gradient-to-br from-teal-500 to-teal-600"
                        subtitle="Generated financial reports"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Summary Card (Span 1) */}
            <div className="space-y-6">
              <div className="hidden lg:flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800 opacity-0">
                <h2 className="text-lg font-semibold">Spacer</h2>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-6 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/50 h-full">
                <h3 className="mb-6 text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Account Summary
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
                          end={dashboardData?.payments || 0}
                          duration={2}
                          separator=","
                        />
                      </span>
                    </div>

                    <div className="mt-8 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            Account Status
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            Active Member
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}