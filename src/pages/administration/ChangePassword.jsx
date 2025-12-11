import { useState } from "react";
import { ResourceForm } from "../../components/common/ResourceForm";
import Toast from "../../components/common/Toast";
import { adminAPI } from "../../services/api";

const FORM_FIELDS = [
  {
    name: "old_password",
    label: "Existing Password",
    type: "password-toggle",
    required: true,
  },
  {
    name: "new_password",
    label: "New Password",
    type: "password-toggle",
    required: true,
  },
  {
    name: "repeat_new_pass",
    label: "Repeat New Password",
    type: "password-toggle",
    required: true,
  },
];

export default function ChangePassword() {
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (formData) => {
    if (formData.new_password !== formData.repeat_new_pass) {
      throw new Error("New passwords do not match");
    }

    if (formData.new_password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Call admin API change password endpoint with exact payload
    const payload = {
      old_password: formData.old_password,
      new_password: formData.new_password,
      repeat_new_pass: formData.repeat_new_pass,
    };

    const res = await adminAPI.changePassword(payload);
    // Expect backend to return JSON { status: true, ... }
    if (!res || res.status === false) {
      throw new Error(res?.message || "Failed to change password");
    }

    return res;
  };

  return (
    <>
      <ResourceForm
        resourceName="change-password"
        fields={FORM_FIELDS}
        title="Your Password"
        subtitle="your password here."
        mode="edit"
        forceEdit
        onSubmit={handleSubmit}
        onSubmitSuccess={() => setShowToast(true)}
        showBackButton={false}
      />
      {showToast && (
        <Toast
          message="Password updated successfully"
          type="success"
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
