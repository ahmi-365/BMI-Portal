import { useEffect, useState } from "react";
import Loader from "../../components/common/Loader";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Toast from "../../components/common/Toast";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { formatDateTime } from "../../lib/dateUtils";
import { adminProfileAPI } from "../../services/api";

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ message: null, type: "success" });

  // --- FIX START: Improved Normalization Logic ---
  const normalizeProfile = (res) => {
    // 1. Target the 'admin' object specifically based on your JSON structure
    const userData = res?.admin || res?.data || res || {};

    // 2. Extract roles/permissions from the root if available (usually flat arrays),
    //    otherwise fallback to the nested object.
    const roles = res?.roles || userData?.roles || [];
    const permissions = res?.permissions || userData?.permissions || [];

    return {
      ...userData, // Spreads id, name, email, phone, etc.
      roles, // Overwrites with the correctly extracted arrays
      permissions,
    };
  };
  // --- FIX END ---

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await adminProfileAPI.profile();
      const data = normalizeProfile(res);
      setProfile(data);
      resetForm(data);
    } catch (err) {
      console.error("Failed to load profile", err);
      setToast({
        message: err.message || "Failed to load profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (data) => {
    setForm({
      name: data?.name || "",
      email: data?.email || "",
      phone: data?.phone || "",
      address: data?.address || "",
    });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetForm(profile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminProfileAPI.update(form);
      setToast({ message: "Profile updated successfully", type: "success" });
      setProfile((prev) => ({ ...prev, ...form }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setToast({
        message: err.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "success" })}
        />
      )}

      <PageMeta title="Admin Profile" />
      <PageBreadcrumb pageTitle="My Profile" />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Header Section with Toggle Button */}
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-6 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "Edit Profile" : "Personal Information"}
            </h2>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-lg transition-colors"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-12">
            {/* Left Column: Avatar & Basic Info */}
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
                <span className="text-5xl font-bold text-brand-600 dark:text-brand-400">
                  {getInitials(profile?.name)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile?.name || "Admin"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administrator
              </p>
              <div className="mt-4 rounded-lg bg-gray-50 px-4 py-2 dark:bg-white/[0.03]">
                <p className="text-xs text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatDateTime(profile?.updated_at) || "N/A"}
                </p>
              </div>
            </div>

            {/* Right Column: Details OR Form */}
            <div className="md:col-span-8">
              {!isEditing ? (
                /* VIEW MODE */
                <div className="space-y-6 rounded-xl bg-gray-50/50 p-6 dark:bg-white/[0.02]">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email Address
                      </h4>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-200">
                        {profile?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Phone Number
                      </h4>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-200">
                        {profile?.phone || "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Physical Address
                      </h4>
                      <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-200">
                        {profile?.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 animate-in fade-in duration-300"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-brand-500 hover:bg-brand-600 text-white min-w-[120px]"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Roles & Permissions Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Roles & Permissions
          </h2>

          <div className="space-y-3">
            {/* Roles */}
            <div className="flex items-start gap-3">
              <span className="min-w-[120px] font-semibold text-gray-700 dark:text-gray-300 pt-0.5">
                Roles:
              </span>
              <div className="flex-1">
                {profile?.roles && profile.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {/* Handle both string ["role"] and object [{name: "role"}] formats */}
                        {typeof role === "object" ? role.name : role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No roles assigned
                  </span>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="flex items-start gap-3">
              <span className="min-w-[120px] font-semibold text-gray-700 dark:text-gray-300 pt-0.5">
                Permissions:
              </span>
              <div className="flex-1">
                {profile?.permissions && profile.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {/* Using Map instead of Join for cleaner tags */}
                    {profile.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {typeof perm === "object" ? perm.name : perm}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    No permissions assigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
  