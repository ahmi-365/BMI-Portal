import { useState, useEffect } from "react";
import {
  FileText,
  CreditCard,
  Package,
  DollarSign,
  ClipboardList,
  Users,
  UserCheck,
  Clock,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const BASE_URL = import.meta.env.VITE_API_BASE;
      const token = localStorage.getItem("bmi_admin_token");

      const response = await fetch(`${BASE_URL}/dashboard`, {
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

  const DashboardCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="mb-1 text-3xl font-semibold text-gray-800 dark:text-white">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  /* -------------------- ERROR -------------------- */
  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-lg text-red-600">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Admin Dashboard" />

      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <PageBreadcrumb
            items={[
              { label: "Admin", href: "/admin" },
              { label: "Dashboard", href: "/admin/dashboard" },
            ]}
          />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              System overview and statistics
            </p>
          </div>

          {/* Documents */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Documents Overview</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Link to="/invoices" className="group">
                <DashboardCard
                  title="Invoices"
                  value={dashboardData?.invoices || 0}
                  icon={FileText}
                  color="bg-blue-500"
                />
              </Link>

              <Link to="/creditnotes" className="group">
                <DashboardCard
                  title="Credit Notes"
                  value={dashboardData?.credit_notes || 0}
                  icon={CreditCard}
                  color="bg-purple-500"
                />
              </Link>

              <Link to="/debitnotes" className="group">
                <DashboardCard
                  title="Debit Notes"
                  value={dashboardData?.debit_notes || 0}
                  icon={FileText}
                  color="bg-orange-500"
                />
              </Link>

              <Link to="/deliveryorders" className="group">
                <DashboardCard
                  title="Delivery Orders"
                  value={dashboardData?.delivery_orders || 0}
                  icon={Package}
                  color="bg-green-500"
                />
              </Link>
            </div>
          </div>

          {/* Financial Info */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">
              Financial Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link to="/payments" className="group">
                <DashboardCard
                  title="Payments"
                  value={dashboardData?.payments || 0}
                  icon={DollarSign}
                  color="bg-indigo-500"
                />
              </Link>

              <Link to="/ppis" className="group">
                <DashboardCard
                  title="PPI Credit Notes"
                  value={dashboardData?.ppi_cn || 0}
                  icon={CreditCard}
                  color="bg-pink-500"
                />
              </Link>

              <Link to="/statements" className="group">
                <DashboardCard
                  title="Statements"
                  value={dashboardData?.statements || 0}
                  icon={ClipboardList}
                  color="bg-teal-500"
                />
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Customer OPR Status</h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* TOTAL CUSTOMERS */}
              <Link
                to="/customers"
                className="group transition hover:scale-[1.02]"
              >
                <DashboardCard
                  title="Total Customers"
                  value={dashboardData?.total_customers || 0}
                  icon={Users}
                  color="bg-blue-600"
                  subtitle="All registered customers"
                />
              </Link>

              {/* APPROVED CUSTOMERS */}
              <Link
                to="/customers/approved"
                className="group transition hover:scale-[1.02]"
              >
                <DashboardCard
                  title="Approved Customers"
                  value={dashboardData?.approved_customers || 0}
                  icon={UserCheck}
                  color="bg-green-600"
                  subtitle="OPR approved"
                />
              </Link>

              {/* PENDING CUSTOMERS */}
              <Link
                to="/customers/pending"
                className="group transition hover:scale-[1.02]"
              >
                <DashboardCard
                  title="Pending Customers"
                  value={dashboardData?.pending_customers || 0}
                  icon={Clock}
                  color="bg-yellow-500"
                  subtitle="Waiting for approval"
                />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Account Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Documents
                  </span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {(dashboardData?.invoices || 0) +
                      (dashboardData?.credit_notes || 0) +
                      (dashboardData?.debit_notes || 0) +
                      (dashboardData?.delivery_orders || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Payments
                  </span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {dashboardData?.payments || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Statements
                  </span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {dashboardData?.statements || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <div className="flex justify-end mt-6">
            <button
              onClick={fetchDashboardData}
              className="rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
