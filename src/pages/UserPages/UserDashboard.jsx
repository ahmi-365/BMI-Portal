import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layout/UserLayout";

export default function UserDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to invoices as default dashboard view
    navigate("/user/invoices");
  }, [navigate]);

  return (
    <UserLayout>
      <div className="flex justify-center items-center h-96 animate-fade-in-up">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </UserLayout>
  );
}
