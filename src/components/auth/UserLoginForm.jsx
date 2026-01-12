import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAuthAPI } from "../../services/api";
import { userAuth } from "../../services/auth";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function UserLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [customerNo, setCustomerNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await userAuthAPI.login(customerNo, password);
      const token = res?.token || res?.data?.token;
      if (token) {
        userAuth.setToken(token);
        // Add a small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate("/user/invoices", { replace: true });
        }, 0);
      } else {
        setError("No token received from server");
        setLoading(false);
      }
    } catch (err) {
      // Extract error message from different formats
      let errorMessage = err.message || "Login failed";

      // Try to parse JSON error response
      try {
        // If error message contains JSON, parse it
        if (errorMessage.includes("API Error:")) {
          const jsonPart = errorMessage.substring(errorMessage.indexOf("{"));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } else if (errorMessage.startsWith("{")) {
          const parsed = JSON.parse(errorMessage);
          errorMessage = parsed.message || parsed.error || errorMessage;
        }
      } catch (e) {
        // If parsing fails, use the original message
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Customer Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to access your account!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5"></div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Customer Number <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your customer number"
                    value={customerNo}
                    onChange={(e) => setCustomerNo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <Eye className="text-gray-500 dark:text-gray-400 size-5" />
                      ) : (
                        <EyeOff className="text-gray-500 dark:text-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
