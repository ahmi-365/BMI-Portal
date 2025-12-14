import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import ChangePasswordCard from "../components/UserProfile/ChangePasswordCard";
import PageMeta from "../components/common/PageMeta";
import Loader from "../components/common/Loader";
import { userAuthAPI } from "../services/api";

export default function UserProfiles() {
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

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="User Profile - BMI Invoice Management System"
        description="Manage your account and profile settings in BMI Invoice Management System. Update personal information and preferences."
      />
      <PageBreadcrumb pageTitle="Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <>
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
              Profile
            </h3>
            <div className="space-y-6">
              <UserInfoCard userData={userData} />
              <UserAddressCard userData={userData} />
            </div>
          </>
        )}

        {activeTab === "password" && (
          <>
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
              Change Password
            </h3>
            <ChangePasswordCard />
          </>
        )}
      </div>
    </>
  );
}
