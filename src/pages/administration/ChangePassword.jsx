import { ResourceForm } from "../../components/common/ResourceForm";

const FORM_FIELDS = [
  {
    name: "existingPassword",
    label: "Existing Password",
    type: "password",
    required: true,
  },
  {
    name: "newPassword",
    label: "New Password",
    type: "password",
    required: true,
  },
  {
    name: "repeatPassword",
    label: "Repeat New Password",
    type: "password",
    required: true,
  },
];

export default function ChangePassword() {
  const handleSubmit = async (formData) => {
    // Validate passwords match
    if (formData.newPassword !== formData.repeatPassword) {
      throw new Error("New passwords do not match");
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const response = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        existingPassword: formData.existingPassword,
        newPassword: formData.newPassword,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to change password");
    }

    return await response.json();
  };

  return (
    <ResourceForm
      resourceName="changepassword"
      fields={FORM_FIELDS}
      title="Change Your Password"
      subtitle="Change your's password here."
      mode="edit"
      onSubmit={handleSubmit}
      showBackButton={false}
    />
  );
}
