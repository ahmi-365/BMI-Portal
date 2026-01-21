import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import UserProtectedRoute from "./components/common/UserProtectedRoute";
import AppLayout from "./layout/AppLayout";
import UserLayout from "./layout/UserLayout";
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
import ExportReport from "./pages/reports/ExportReport";
import UserCreditNotes from "./pages/UserPages/UserCreditNotes";
import UserCreditNoteShow from "./pages/UserPages/UserCreditNoteShow";
import UserDashboard from "./pages/UserPages/UserDashboard";
import UserDebitNotes from "./pages/UserPages/UserDebitNotes";
import UserDebitNoteShow from "./pages/UserPages/UserDebitNoteShow";
import UserDeliveryOrders from "./pages/UserPages/UserDeliveryOrders";
import UserDeliveryOrderShow from "./pages/UserPages/UserDeliveryOrderShow";
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
            <Route index path="/" element={<Home />} />
            <Route path="/profile" element={<AdminProfile />} />
            {/* Admin Users (wildcard so TabbedResource routes work) */}
            <Route path="/admin-users/*" element={<AdminUsersIndex />} />
            <Route path="/admins/show/:id" element={<AdminShow />} />
            <Route path="/admins/edit/:id" element={<AdminCreate />} />
            {/* Payment Records */}
            <Route path="/payments/view" element={<PaymentRecordsView />} />
            <Route path="/payments/add" element={<PaymentRecordsAdd />} />
            <Route path="/payments" element={<PaymentRecordsView />} />
            <Route path="/payments/edit/:id" element={<PaymentRecordsAdd />} />
            <Route path="/payments/show/:id" element={<PaymentRecordsShow />} />
            <Route
              path="/payments/approved/show/:id"
              element={<PaymentRecordsShow />}
            />
            <Route
              path="/payments/pending/show/:id"
              element={<PaymentRecordsShow />}
            />
            <Route
              path="/payments/batch-upload"
              element={<PaymentRecordsBatchUpload />}
            />
            {/* Invoices (wildcard so TabbedResource routes work) */}
            <Route path="/invoices/*" element={<InvoicesIndex />} />
            <Route path="/invoices/edit/:id" element={<InvoicesEdit />} />
            <Route path="/invoices/index/show/:id" element={<InvoicesShow />} />
            {/* Delivery Orders (wildcard so TabbedResource routes work) */}
            <Route path="/deliveryorders/*" element={<DeliveryOrdersIndex />} />
            <Route
              path="/deliveryorders/edit/:id"
              element={<DeliveryOrdersEdit />}
            />
            <Route
              path="/deliveryorders/show/:id"
              element={<DeliveryOrdersShow />}
            />
            {/* Debit Notes (wildcard so TabbedResource routes work) */}
            <Route path="/debitnotes/*" element={<DebitNotesIndex />} />
            <Route path="/debitnotes/edit/:id" element={<DebitNotesEdit />} />
            <Route path="/debitnotes/show/:id" element={<DebitNotesShow />} />
            {/* Credit Notes (wildcard so TabbedResource routes work) */}
            <Route path="/creditnotes/*" element={<CreditNotesIndex />} />
            <Route path="/creditnotes/edit/:id" element={<CreditNotesEdit />} />
            <Route path="/creditnotes/show/:id" element={<CreditNotesShow />} />
            {/* Account Statements (use wildcard so TabbedResource routes work)
                - The Index component contains the TabbedResource and will render
                  correct tab based on the subpath (e.g. /account-statements/add).
                - Show/Edit routes remain defined below to render full-page views. */}
            <Route path="/statements/*" element={<AccountStatementsIndex />} />
            <Route
              path="/statements/edit/:id"
              element={<AccountStatementsEdit />}
            />
            <Route
              path="/statements/show/:id"
              element={<AccountStatementsShow />}
            />
            {/* Also accept direct /statements routes because DataTable and other
                  components navigate using the resource name (e.g. /statements/show/:id) */}
            <Route path="/statements/*" element={<AccountStatementsIndex />} />
            <Route
              path="/statements/edit/:id"
              element={<AccountStatementsEdit />}
            />
            <Route
              path="/statements/show/:id"
              element={<AccountStatementsShow />}
            />
            {/* Customers (wildcard so TabbedResource routes work) */}
            <Route path="/customers/*" element={<CustomersIndex />} />
            <Route path="/customers/edit/:id" element={<CustomersEdit />} />
            <Route path="/customers/show/:id" element={<CustomersShow />} />
            {/* Support direct show routes for filtered resource aliases */}
            <Route
              path="/approved-customers/show/:id"
              element={<CustomersShow />}
            />
            <Route
              path="/pending-customers/show/:id"
              element={<CustomersShow />}
            />
            <Route path="/administration/*" element={<AdministrationIndex />} />
            <Route path="/reports/export" element={<ExportReport />} />
            <Route path="/ppis/*" element={<PpisIndex />} />
            <Route path="/ppis/show/:id" element={<PpisShow />} />
            <Route path="/ppis/edit/:id" element={<PpisEdit />} />
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
