import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "../AuthPages/AuthPageLayout";
import UserLoginForm from "../../components/auth/UserLoginForm";

export default function UserLogin() {
  return (
    <>
      <PageMeta
        title="Customer Login - BMI Invoice Management System"
        description="Customer login portal for BMI Invoice Management System."
      />
      <AuthLayout>
        <UserLoginForm />
      </AuthLayout>
    </>
  );
}
