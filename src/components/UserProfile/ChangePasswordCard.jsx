import { useState } from "react";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { userAuthAPI } from "../../services/api";

export default function ChangePasswordCard() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    repeat_new_pass: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Attempt to surface meaningful API error details (e.g., "Old password is incorrect")
  const extractErrorMessage = (err) => {
    if (err?.response?.data?.message) return err.response.data.message;

    if (err?.message) {
      // Look for a JSON blob inside the message string
      const jsonMatch = err.message.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.message) return parsed.message;
        } catch (_) {
          /* ignore JSON parse issues */
        }
      }

      // Fallback to the raw message after the status code
      const parts = err.message.split("API Error:");
      if (parts[1]) return parts[1].trim();
    }

    return "Failed to change password";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation
    if (
      !formData.old_password ||
      !formData.new_password ||
      !formData.repeat_new_pass
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.new_password !== formData.repeat_new_pass) {
      setError("New passwords do not match");
      return;
    }

    if (formData.new_password.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await userAuthAPI.changePassword(formData);

      if (response.status === "success") {
        setSuccess("Password changed successfully");
        setFormData({
          old_password: "",
          new_password: "",
          repeat_new_pass: "",
        });
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/10 dark:border-green-800 dark:text-green-400">
              {success}
            </div>
          )}

          <div>
            <Label htmlFor="old_password">Current Password</Label>
            <Input
              type="password"
              id="old_password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <Label htmlFor="new_password">New Password</Label>
            <Input
              type="password"
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter your new password"
              required
            />
          </div>

          <div>
            <Label htmlFor="repeat_new_pass">Confirm New Password</Label>
            <Input
              type="password"
              id="repeat_new_pass"
              name="repeat_new_pass"
              value={formData.repeat_new_pass}
              onChange={handleChange}
              placeholder="Confirm your new password"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
