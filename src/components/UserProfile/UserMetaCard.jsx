import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard({ userData }) {
  const { isOpen, openModal, closeModal } = useModal();

  // Helper to split name for the form defaults
  const [firstName = "", ...rest] = (userData?.name || "").split(" ");
  const lastName = rest.join(" ");

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.currentTarget; // Now refers to the <form> element

    // Create FormData directly from the form element
    // This automatically captures all inputs with 'name' attributes
    const formData = new FormData(form);

    try {
      // Dynamic import is fine, but ensure path is correct
      const { userAuthAPI } = await import("../../services/api");
      await userAuthAPI.updateProfile(formData);
      closeModal();
      // Optional: Trigger a data refresh here if needed
    } catch (err) {
      console.error("Profile update failed", err);
      // Optional: Add UI error handling here
    }
  };

  if (!userData) return null;

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-2xl font-semibold">
              {(userData?.name || "").trim().charAt(0).toUpperCase() || "U"}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {userData.name || "N/A"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userData.company || "N/A"}
                </p>
                <>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customer No: {userData.customer_no || "N/A"}
                  </p>
                </>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
