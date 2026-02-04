import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Forbidden from "./components/common/Forbidden";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RouteGuard from "./components/common/RouteGuard";
import { ScrollToTop } from "./components/common/ScrollToTop";
import UserProtectedRoute from "./components/common/UserProtectedRoute";
import AppLayout from "./layout/AppLayout";
import UserLayout from "./layout/UserLayout";
import { canAccess, getFirstAccessiblePath } from "./lib/permissionHelper";
import AdminCreate from "./pages/admins/AdminCreate";
import AdminProfile from "./pages/admins/AdminProfile";
import AdminShow from "./pages/admins/AdminShow";
import SignIn from "./pages/AuthPages/SignIn";
import Home from "./pages/Dashboard/Home";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";

// Payment Records
import PaymentRecordsAdd from "./pages/payment-records/Add";
import PaymentRecordsBatchUpload from "./pages/payment-records/BatchUpload";
import PaymentRecordsShow from "./pages/payment-records/Show";
import PaymentRecordsView from "./pages/payment-records/View";

// Invoices
import InvoicesEdit from "./pages/invoices/Edit";
import InvoicesIndex from "./pages/invoices/Index";
import InvoicesShow from "./pages/invoices/Show";

// Delivery Orders
import DeliveryOrdersEdit from "./pages/delivery-orders/Edit";
import DeliveryOrdersIndex from "./pages/delivery-orders/Index";
import DeliveryOrdersShow from "./pages/delivery-orders/Show";

// Debit Notes
import DebitNotesEdit from "./pages/debit-notes/Edit";
import DebitNotesIndex from "./pages/debit-notes/Index";
import DebitNotesShow from "./pages/debit-notes/Show";

// Credit Notes
import CreditNotesEdit from "./pages/credit-notes/Edit";
import CreditNotesIndex from "./pages/credit-notes/Index";
import CreditNotesShow from "./pages/credit-notes/Show";

// Account Statements
import AccountStatementsEdit from "./pages/account-statements/Edit";
import AccountStatementsIndex from "./pages/account-statements/Index";
import AccountStatementsShow from "./pages/account-statements/Show";

// Customers
import CustomersEdit from "./pages/customers/Edit";
import CustomersIndex from "./pages/customers/Index";
import CustomersShow from "./pages/customers/Show";

// Admin Users
import AdminUsersIndex from "./pages/admin-users/Index";

// User Panel Auth
import UserLogin from "./pages/UserPages/UserLogin";

// User Panel Pages
import AdministrationIndex from "./pages/administration/Index";
import RolesAdd from "./pages/administration/roles/Add";
import RolesEdit from "./pages/administration/roles/Edit";
import RolesShow from "./pages/administration/roles/Show";
import ExportReport from "./pages/reports/ExportReport";
import UserCreditNotes from "./pages/UserPages/UserCreditNotes";
import UserCreditNoteShow from "./pages/UserPages/UserCreditNoteShow";
import UserDashboard from "./pages/UserPages/UserDashboard";
import UserDebitNotes from "./pages/UserPages/UserDebitNotes";
import UserDebitNoteShow from "./pages/UserPages/UserDebitNoteShow";
import UserDeliveryOrders from "./pages/UserPages/UserDeliveryOrders";
import UserDeliveryOrderShow from "./pages/UserPages/UserDeliveryOrderShow";
import UserExportReport from "./pages/UserPages/UserExportreport";
import UserInvoices from "./pages/UserPages/UserInvoices";
import UserInvoiceShow from "./pages/UserPages/UserInvoiceShow";
import UserPaymentAdd from "./pages/UserPages/UserPaymentAdd";
import UserPayments from "./pages/UserPages/UserPayments";
import UserPaymentShow from "./pages/UserPages/UserPaymentShow";
import UserProfileEdit from "./pages/UserPages/UserProfileEdit";
import UserStatements from "./pages/UserPages/UserStatements";
import UserStatementShow from "./pages/UserPages/UserStatementShow";
// CN PPI
import PpisEdit from "./pages/ppis/Edit";
import PpisIndex from "./pages/ppis/Index";
import PpisShow from "./pages/ppis/Show";
import UserPPIs from "./pages/UserPages/UserPpis";
import UserPpiShow from "./pages/UserPages/UserPpiShow";

export default function App() {
  const DashboardEntry = () => {
    if (canAccess("view-dashboard")) {
      return <Home />;
    }

    const redirectTo = getFirstAccessiblePath(null);
    if (redirectTo && redirectTo !== "/") {
      return <Navigate to={redirectTo} replace />;
    }

    return <Forbidden />;
  };

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout (protected) */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<DashboardEntry />} />
            <Route path="/profile" element={<AdminProfile />} />
            {/* Admin Users */}
            <Route
              path="/admin-users/*"
              element={
                <RouteGuard permission="view-admins">
                  <AdminUsersIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/admins/show/:id"
              element={
                <RouteGuard permission="view-admins">
                  <AdminShow />
                </RouteGuard>
              }
            />
            <Route
              path="/admins/edit/:id"
              element={
                <RouteGuard permission="create-admins">
                  <AdminCreate />
                </RouteGuard>
              }
            />
            {/* Payment Records */}
            <Route
              path="/payments/view"
              element={
                <RouteGuard permission="list-payments">
                  <PaymentRecordsView />
                </RouteGuard>
              }
            />
            <Route
              path="/payments/add"
              element={
                <RouteGuard permission="create-payments">
                  <PaymentRecordsAdd />
                </RouteGuard>
              }
            />
            <Route
              path="/payments"
              element={
                <RouteGuard permission="list-payments">
                  <PaymentRecordsView />
                </RouteGuard>
              }
            />
            <Route
              path="/payments/edit/:id"
              element={
                <RouteGuard permission="edit-payments">
                  <PaymentRecordsAdd />
                </RouteGuard>
              }
            />
            <Route
              path="/payments/show/:id"
              element={
                <RouteGuard permission="view-payments">
                  <PaymentRecordsShow />
                </RouteGuard>
              }
            />
            <Route
              path="/payments/approved/show/:id"
              element={
                <RouteGuard permission="view-payments">
                  <PaymentRecordsShow />
                </RouteGuard>
              }
            />
            <Route
              path="/payments/pending/show/:id"
              element={
                <RouteGuard permission="view-payments">
                  <PaymentRecordsShow />
                </RouteGuard>
              }
            />
            <Route
              path="/payments/batch-upload"
              element={
                <RouteGuard permission="create-payments">
                  <PaymentRecordsBatchUpload />
                </RouteGuard>
              }
            />
            {/* Invoices */}
            <Route
              path="/invoices/*"
              element={
                <RouteGuard permission="list-invoices">
                  <InvoicesIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/invoices/edit/:id"
              element={
                <RouteGuard permission="edit-invoices">
                  <InvoicesEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/invoices/index/show/:id"
              element={
                <RouteGuard permission="view-invoices">
                  <InvoicesShow />
                </RouteGuard>
              }
            />
            {/* Delivery Orders */}
            <Route
              path="/deliveryorders/*"
              element={
                <RouteGuard permission="list-delivery-orders">
                  <DeliveryOrdersIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/deliveryorders/edit/:id"
              element={
                <RouteGuard permission="edit-delivery-orders">
                  <DeliveryOrdersEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/deliveryorders/show/:id"
              element={
                <RouteGuard permission="view-delivery-orders">
                  <DeliveryOrdersShow />
                </RouteGuard>
              }
            />
            {/* Debit Notes */}
            <Route
              path="/debitnotes/*"
              element={
                <RouteGuard permission="list-debit-notes">
                  <DebitNotesIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/debitnotes/edit/:id"
              element={
                <RouteGuard permission="edit-debit-notes">
                  <DebitNotesEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/debitnotes/show/:id"
              element={
                <RouteGuard permission="view-debit-notes">
                  <DebitNotesShow />
                </RouteGuard>
              }
            />
            {/* Credit Notes */}
            <Route
              path="/creditnotes/*"
              element={
                <RouteGuard permission="list-credit-notes">
                  <CreditNotesIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/creditnotes/edit/:id"
              element={
                <RouteGuard permission="edit-credit-notes">
                  <CreditNotesEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/creditnotes/show/:id"
              element={
                <RouteGuard permission="view-credit-notes">
                  <CreditNotesShow />
                </RouteGuard>
              }
            />
            {/* Account Statements (use wildcard so TabbedResource routes work)
                - The Index component contains the TabbedResource and will render
                  correct tab based on the subpath (e.g. /account-statements/add).
                - Show/Edit routes remain defined below to render full-page views. */}
            {/* Account Statements */}
            <Route
              path="/statements/*"
              element={
                <RouteGuard permission="list-statements">
                  <AccountStatementsIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/statements/edit/:id"
              element={
                <RouteGuard permission="edit-statements">
                  <AccountStatementsEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/statements/show/:id"
              element={
                <RouteGuard permission="view-statements">
                  <AccountStatementsShow />
                </RouteGuard>
              }
            />
            {/* Customers */}
            <Route
              path="/customers/*"
              element={
                <RouteGuard permission="list-customers">
                  <CustomersIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/customers/edit/:id"
              element={
                <RouteGuard permission="edit-customers">
                  <CustomersEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/customers/show/:id"
              element={
                <RouteGuard permission="view-customers">
                  <CustomersShow />
                </RouteGuard>
              }
            />
            {/* Support direct show routes for filtered resource aliases */}
            <Route
              path="/approved-customers/show/:id"
              element={
                <RouteGuard permission="view-customers">
                  <CustomersShow />
                </RouteGuard>
              }
            />
            <Route
              path="/pending-customers/show/:id"
              element={
                <RouteGuard permission="view-customers">
                  <CustomersShow />
                </RouteGuard>
              }
            />
            <Route
              path="/administration/roles/add"
              element={
                <RouteGuard permission="create-roles">
                  <RolesAdd />
                </RouteGuard>
              }
            />
            <Route
              path="/administration/roles/edit/:id"
              element={
                <RouteGuard permission="edit-roles">
                  <RolesEdit />
                </RouteGuard>
              }
            />
            <Route
              path="/administration/roles/show/:id"
              element={
                <RouteGuard permission="view-roles">
                  <RolesShow />
                </RouteGuard>
              }
            />
            <Route
              path="/roles/show/:id"
              element={
                <RouteGuard permission="view-roles">
                  <RolesShow />
                </RouteGuard>
              }
            />
            <Route path="/administration/*" element={<AdministrationIndex />} />
            <Route
              path="/reports/export"
              element={
                <RouteGuard permission="bulk-reports-exports">
                  <ExportReport />
                </RouteGuard>
              }
            />
            <Route
              path="/ppis/*"
              element={
                <RouteGuard permission="list-ppis">
                  <PpisIndex />
                </RouteGuard>
              }
            />
            <Route
              path="/ppis/show/:id"
              element={
                <RouteGuard permission="view-ppis">
                  <PpisShow />
                </RouteGuard>
              }
            />
            <Route
              path="/ppis/edit/:id"
              element={
                <RouteGuard permission="edit-ppis">
                  <PpisEdit />
                </RouteGuard>
              }
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* User Panel */}
          <Route path="/user/login" element={<UserLogin />} />

          {/* User Panel Protected Routes */}
          <Route
            element={
              <UserProtectedRoute>
                <UserLayout />
              </UserProtectedRoute>
            }
          >
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile" element={<UserProfiles />} />
            <Route path="/user/profile/edit" element={<UserProfileEdit />} />
            <Route path="/user/invoices" element={<UserInvoices />} />
            <Route
              path="/user/invoices/show/:id"
              element={<UserInvoiceShow />}
            />
            <Route
              path="/user/delivery-orders"
              element={<UserDeliveryOrders />}
            />
            <Route
              path="/user/delivery-orders/show/:id"
              element={<UserDeliveryOrderShow />}
            />
            <Route path="/user/debit-notes" element={<UserDebitNotes />} />
            <Route
              path="/user/debit-notes/show/:id"
              element={<UserDebitNoteShow />}
            />
            <Route path="/user/credit-notes" element={<UserCreditNotes />} />
            <Route
              path="/user/credit-notes/show/:id"
              element={<UserCreditNoteShow />}
            />
            <Route path="/user/payments" element={<UserPayments />} />
            <Route path="/user/payments/add" element={<UserPaymentAdd />} />
            <Route
              path="/user/payments/show/:id"
              element={<UserPaymentShow />}
            />
            <Route path="/user/statements" element={<UserStatements />} />
            <Route path="/user/ppi" element={<UserPPIs />} />
            <Route path="/user/ppis/show/:id" element={<UserPpiShow />} />
            <Route
              path="/user/statements/show/:id"
              element={<UserStatementShow />}
            />
            <Route path="/user/export-report" element={<UserExportReport />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
