import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/common/Loader";
import UserAddressEditForm from "../../components/UserProfile/UserAddressEditForm";
import { userAuthAPI } from "../../services/api";

export default function UserProfileEdit() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Edit Profile" />
      <PageBreadcrumb
        breadcrumb={[
          { label: "Home", link: "/" },
          { label: "Profile", link: "/user/profile" },
          { label: "Edit", active: true },
        ]}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-6xl mx-auto">
          {userData && (
            <UserAddressEditForm
              userData={userData}
              onBack={() => navigate("/user/profile")}
            />
          )}
        </div>
      </div>
    </>
  );
}
