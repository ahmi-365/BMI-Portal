import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up - BMI Invoice Management System"
        description="Create your account for BMI Invoice Management System. Manage invoices, payments, and business operations efficiently."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
