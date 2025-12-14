import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import UserAddressCard from "../../components/UserProfile/UserAddressCard";
import ChangePasswordCard from "../../components/UserProfile/ChangePasswordCard";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import { userAuthAPI } from "../../services/api";

export default function UserDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAuthAPI.profile();

        if (response.status === "success") {
          setUserData(response.user);
        } else {
          setError("Failed to load profile data");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="My Dashboard" />
      <PageBreadcrumb
        breadcrumb={[
          { label: "Home", link: "/user/dashboard" },
          { label: "Dashboard", active: true },
        ]}
      />
      <div className="flex flex-col gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userData?.name || "User"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile and account settings
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Profile Meta */}
          <UserMetaCard userData={userData} />

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === "password"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              Security
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6 animate-fade-in-up">
              <UserInfoCard userData={userData} />
              <UserAddressCard userData={userData} />
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="animate-fade-in-up">
              <ChangePasswordCard />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
