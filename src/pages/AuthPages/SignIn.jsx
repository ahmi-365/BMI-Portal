import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Login - BMI Invoice Management System"
        description="Secure login portal for BMI Invoice Management System. Access your invoices, payments, and business data."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
