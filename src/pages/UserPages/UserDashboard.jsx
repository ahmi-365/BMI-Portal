import { useState, useEffect } from "react";
import { FileText, CreditCard, Package, DollarSign, ClipboardList } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import PageMeta from "../../components/common/PageMeta";
import { userAuthAPI } from "../../services/api";

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userData, setUserData] = useState(null);
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
      const token = localStorage.getItem('bmi_user_token');

      const [profileResponse, dashboardResponse] = await Promise.all([
        userAuthAPI.profile(),
        fetch(`${BASE_URL}/user/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
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
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const DashboardCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-semibold text-gray-800 dark:text-white/90 mb-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 dark:text-red-400 text-lg">
              Error loading dashboard: {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="User Dashboard" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <PageBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/user/dashboard" }
            ]}
          />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {userData?.name || "User"}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Here's an overview of your account activity
            </p>
          </div>

          {/* Documents Overview */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
              Documents Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="Invoices"
                value={dashboardData?.invoices || 0}
                icon={FileText}
                color="bg-blue-500"
                subtitle="Your invoices"
              />
              <DashboardCard
                title="Credit Notes"
                value={dashboardData?.credit_notes || 0}
                icon={CreditCard}
                color="bg-purple-500"
                subtitle="Credits issued"
              />
              <DashboardCard
                title="Debit Notes"
                value={dashboardData?.debit_notes || 0}
                icon={FileText}
                color="bg-orange-500"
                subtitle="Debits recorded"
              />
              <DashboardCard
                title="Delivery Orders"
                value={dashboardData?.delivery_orders || 0}
                icon={Package}
                color="bg-green-500"
                subtitle="Your orders"
              />
            </div>
          </div>

          {/* Payments & Statements Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
              Financial Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardCard
                title="Payments"
                value={dashboardData?.payments || 0}
                icon={DollarSign}
                color="bg-indigo-500"
                subtitle="Your payment records"
              />
              <DashboardCard
                title="PPI Credit Notes"
                value={dashboardData?.ppi_cn || 0}
                icon={CreditCard}
                color="bg-pink-500"
                subtitle="PPI related credits"
              />
              <DashboardCard
                title="Statements"
                value={dashboardData?.statements || 0}
                icon={ClipboardList}
                color="bg-teal-500"
                subtitle="Financial statements"
              />
            </div>
          </div>

          {/* Additional Info & Quick Actions */}
        

          {/* Refresh Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-gray-800 dark:bg-white/10 hover:bg-gray-700 dark:hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}