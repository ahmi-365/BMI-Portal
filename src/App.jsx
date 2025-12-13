import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import ProtectedRoute from "./components/common/ProtectedRoute";
import UserProtectedRoute from "./components/common/UserProtectedRoute";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AdminView from "./pages/admins/AdminView";
import AdminCreate from "./pages/admins/AdminCreate";
import AdminShow from "./pages/admins/AdminShow";
import UserLayout from "./layout/UserLayout";

// Payment Records
import PaymentRecordsView from "./pages/payment-records/View";
import PaymentRecordsAdd from "./pages/payment-records/Add";
import PaymentRecordsEdit from "./pages/payment-records/Edit";
import PaymentRecordsShow from "./pages/payment-records/Show";
import PaymentRecordsBatchUpload from "./pages/payment-records/BatchUpload";

// Invoices
import InvoicesView from "./pages/invoices/View";
import InvoicesAdd from "./pages/invoices/Add";
import InvoicesEdit from "./pages/invoices/Edit";
import InvoicesShow from "./pages/invoices/Show";
import InvoicesBatchUpload from "./pages/invoices/BatchUpload";
import InvoicesIndex from "./pages/invoices/Index";

// Delivery Orders
import DeliveryOrdersView from "./pages/delivery-orders/View";
import DeliveryOrdersAdd from "./pages/delivery-orders/Add";
import DeliveryOrdersEdit from "./pages/delivery-orders/Edit";
import DeliveryOrdersShow from "./pages/delivery-orders/Show";
import DeliveryOrdersBatchUpload from "./pages/delivery-orders/BatchUpload";
import DeliveryOrdersIndex from "./pages/delivery-orders/Index";

// Debit Notes
import DebitNotesView from "./pages/debit-notes/View";
import DebitNotesAdd from "./pages/debit-notes/Add";
import DebitNotesEdit from "./pages/debit-notes/Edit";
import DebitNotesShow from "./pages/debit-notes/Show";
import DebitNotesBatchUpload from "./pages/debit-notes/BatchUpload";
import DebitNotesIndex from "./pages/debit-notes/Index";

// Credit Notes
import CreditNotesView from "./pages/credit-notes/View";
import CreditNotesAdd from "./pages/credit-notes/Add";
import CreditNotesEdit from "./pages/credit-notes/Edit";
import CreditNotesShow from "./pages/credit-notes/Show";
import CreditNotesBatchUpload from "./pages/credit-notes/BatchUpload";
import CreditNotesIndex from "./pages/credit-notes/Index";

// Account Statements
import AccountStatementsView from "./pages/account-statements/View";
import AccountStatementsAdd from "./pages/account-statements/Add";
import AccountStatementsEdit from "./pages/account-statements/Edit";
import AccountStatementsShow from "./pages/account-statements/Show";
import AccountStatementsBatchUpload from "./pages/account-statements/BatchUpload";
import AccountStatementsIndex from "./pages/account-statements/Index";

// Customers
import CustomersView from "./pages/customers/View";
import CustomersAdd from "./pages/customers/Add";
import CustomersEdit from "./pages/customers/Edit";
import CustomersShow from "./pages/customers/Show";
import CustomersBatchUpload from "./pages/customers/BatchUpload";
import CustomersIndex from "./pages/customers/Index";

// Admin Users
import AdminUsersBatchUpload from "./pages/admin-users/BatchUpload";
import AdminUsersIndex from "./pages/admin-users/Index";

// User Panel Auth
import UserLogin from "./pages/UserPages/UserLogin";

// User Panel Pages
import UserDashboard from "./pages/UserPages/UserDashboard";
import UserInvoices from "./pages/UserPages/UserInvoices";
import UserInvoiceShow from "./pages/UserPages/UserInvoiceShow";
import UserDeliveryOrders from "./pages/UserPages/UserDeliveryOrders";
import UserDeliveryOrderShow from "./pages/UserPages/UserDeliveryOrderShow";
import UserDebitNotes from "./pages/UserPages/UserDebitNotes";
import UserDebitNoteShow from "./pages/UserPages/UserDebitNoteShow";
import UserCreditNotes from "./pages/UserPages/UserCreditNotes";
import UserCreditNoteShow from "./pages/UserPages/UserCreditNoteShow";
import UserPayments from "./pages/UserPages/UserPayments";
import UserPaymentShow from "./pages/UserPages/UserPaymentShow";
import UserStatements from "./pages/UserPages/UserStatements";
import UserStatementShow from "./pages/UserPages/UserStatementShow";
import AdministrationIndex from "./pages/administration/Index";

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
            <Route path="/profile" element={<UserProfiles />} />
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
            <Route path="/administration/*" element={<AdministrationIndex />} />
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
            <Route path="/user/invoices" element={<UserInvoices />} />
            <Route path="/user/invoices/:id" element={<UserInvoiceShow />} />
            <Route
              path="/user/delivery-orders"
              element={<UserDeliveryOrders />}
            />
            <Route
              path="/user/delivery-orders/:id"
              element={<UserDeliveryOrderShow />}
            />
            <Route path="/user/debit-notes" element={<UserDebitNotes />} />
            <Route
              path="/user/debit-notes/:id"
              element={<UserDebitNoteShow />}
            />
            <Route path="/user/credit-notes" element={<UserCreditNotes />} />
            <Route
              path="/user/credit-notes/:id"
              element={<UserCreditNoteShow />}
            />
            <Route path="/user/payments" element={<UserPayments />} />
            <Route path="/user/payments/:id" element={<UserPaymentShow />} />
            <Route path="/user/statements" element={<UserStatements />} />
            <Route
              path="/user/statements/:id"
              element={<UserStatementShow />}
            />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
