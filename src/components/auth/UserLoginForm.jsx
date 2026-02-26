import { ArrowDown, Eye, EyeOff, FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAuthAPI } from "../../services/api";
import { userAuth } from "../../services/auth";
import ConfirmationModal from "../common/ConfirmationModal";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function UserLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // Keep me logged in
  const [tcChecked, setTcChecked] = useState(false); // Terms & Conditions
  const [showTcModal, setShowTcModal] = useState(false); // T&C Modal state
  const [canAcceptTc, setCanAcceptTc] = useState(false); // Tracks if scrolled to bottom

  const [identity, setidentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const tcScrollRef = useRef(null);

  // Check if T&C content requires scrolling when modal opens
  useEffect(() => {
    if (showTcModal && tcScrollRef.current) {
      const { scrollHeight, clientHeight } = tcScrollRef.current;
      // If content is shorter than the container, allow accepting immediately
      if (scrollHeight <= clientHeight) {
        setCanAcceptTc(true);
      } else {
        setCanAcceptTc(false);
      }
    }
  }, [showTcModal]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Add a small 2px buffer to prevent fractional pixel rounding issues on certain zoom levels
    if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 2) {
      setCanAcceptTc(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!tcChecked) {
      setError("Please read and accept the Terms and Conditions to continue.");
      return;
    }

    setShowModal(true);
  };

  const performLogin = async () => {
    setLoading(true);
    try {
      const res = await userAuthAPI.login(identity, password);
      const token = res?.token || res?.data?.token;
      if (token) {
        userAuth.setToken(token);
        setTimeout(() => {
          navigate("/user/dashboard", { replace: true });
        }, 0);
      } else {
        setError("No token received from server");
        setLoading(false);
      }
    } catch (err) {
      let errorMessage = err.message || "Login failed";
      try {
        if (errorMessage.includes("API Error:")) {
          const jsonPart = errorMessage.substring(errorMessage.indexOf("{"));
          const parsed = JSON.parse(jsonPart);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } else if (errorMessage.startsWith("{")) {
          const parsed = JSON.parse(errorMessage);
          errorMessage = parsed.message || parsed.error || errorMessage;
        }
      } catch (e) {
        // Fallback to original
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    setShowModal(false);
    performLogin();
  };

  const handleTcCheckboxChange = (val) => {
    if (val) {
      setShowTcModal(true);
    } else {
      setTcChecked(false);
    }
  };

  const handleAcceptTc = () => {
    setTcChecked(true);
    setShowTcModal(false);
    setError("");
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
              Enter your Customer Number/Email and password to access your
              account!
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5"></div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Customer Number / Email{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter your customer number"
                    value={identity}
                    onChange={(e) => setidentity(e.target.value)}
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

                <div className="flex flex-col gap-4">
                  {/* Keep me logged in */}
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <Checkbox
                        checked={tcChecked}
                        onChange={handleTcCheckboxChange}
                      />
                    </div>
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400 leading-tight">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTcModal(true)}
                        className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      >
                        Terms and Conditions
                      </button>
                      <span className="text-error-500 ml-1">*</span>
                    </span>
                  </div>
                </div>

                <div>
                  {/* Login Button - DISABLED if T&C not checked */}
                  <Button
                    type="submit"
                    className={`w-full ${!tcChecked ? "opacity-50 cursor-not-allowed" : ""}`}
                    size="sm"
                    disabled={loading || !tcChecked}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Acknowledgement Required"
        message="Please acknowledge the following before proceeding with login."
        confirmText="Login"
        cancelText="Cancel"
        isLoading={loading}
        requireAcknowledgement={true}
        acknowledgementText="I acknowledge that amounts are converted to MYR and I have read and accept the Bribery Act / Code of Conduct."
      />

      {/* --- Terms and Conditions Modal --- */}
      {showTcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Terms and Conditions
                </h3>
              </div>
              <button
                onClick={() => setShowTcModal(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Container with onScroll event */}
            <div
              ref={tcScrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 text-sm text-gray-600 dark:text-gray-400 space-y-4 custom-scrollbar"
            >
              <p>
                <strong>1. Acceptance of Terms</strong>
                <br />
                By accessing and using this portal, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>
              <p>
                <strong>2. Use of the Portal</strong>
                <br />
                You agree to use the portal only for lawful purposes. You are
                strictly prohibited from using our portal for any illegal or
                unauthorized purpose.
              </p>
              <p>
                <strong>3. User Account Security</strong>
                <br />
                You are responsible for maintaining the confidentiality of your
                login credentials and are fully responsible for all activities
                that occur under your account.
              </p>
              <p>
                <strong>4. Data Privacy</strong>
                <br />
                We respect your privacy and are committed to protecting your
                personal data. Any personal information provided to or gathered
                by this portal is controlled in accordance with our Privacy
                Policy.
              </p>
              <p>
                <strong>5. Modifications to Service</strong>
                <br />
                We reserve the right to modify or discontinue, temporarily or
                permanently, the service (or any part thereof) with or without
                notice at any time.
              </p>
              <p>
                <strong>6. Limitation of Liability</strong>
                <br />
                We shall not be liable for any direct, indirect, incidental,
                special, or consequential damages resulting from the use or
                inability to use the portal.
              </p>
              <p>
                <strong>7. Code of Conduct</strong>
                <br />
                You agree to comply with our Bribery Act and Code of Conduct
                policies at all times while utilizing this service. Any breach
                of these policies will result in immediate termination of your
                account access.
              </p>
              <p className="pb-4">
                <em>
                  Please read these terms carefully. By clicking "Continue &
                  Accept" below, you confirm that you have read, understood, and
                  agreed to these conditions.
                </em>
              </p>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 flex justify-between items-center gap-3">
              {/* Contextual instruction message */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                {!canAcceptTc && (
                  <>
                    <ArrowDown className="h-3.5 w-3.5 animate-bounce text-blue-500" />
                    Please scroll to the bottom to accept
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTcModal(false)}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>

                {/* Conditionally render the accept button */}
                {canAcceptTc ? (
                  <button
                    type="button"
                    onClick={handleAcceptTc}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors animate-in fade-in duration-300"
                  >
                    Continue & Accept
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-lg bg-gray-300 px-5 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  >
                    Continue & Accept
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
