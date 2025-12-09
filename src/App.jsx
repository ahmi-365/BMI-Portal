import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ProtectedRoute from "./components/common/ProtectedRoute";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AdminView from "./pages/admins/AdminView";
import AdminCreate from "./pages/admins/AdminCreate";
import AdminShow from "./pages/admins/AdminShow";

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

// Administration
import AdministrationView from "./pages/administration/View";
import AdministrationAdd from "./pages/administration/Add";
import AdministrationEdit from "./pages/administration/Edit";
import AdministrationShow from "./pages/administration/Show";
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
            <Route
              path="/payment-records/view"
              element={<PaymentRecordsView />}
            />
            <Route
              path="/payment-records/add"
              element={<PaymentRecordsAdd />}
            />
            <Route path="/payment-records" element={<PaymentRecordsView />} />
            <Route
              path="/payment-records/edit/:id"
              element={<PaymentRecordsEdit />}
            />
            <Route
              path="/payment-records/show/:id"
              element={<PaymentRecordsShow />}
            />
            <Route
              path="/payment-records/batch-upload"
              element={<PaymentRecordsBatchUpload />}
            />

            {/* Invoices (wildcard so TabbedResource routes work) */}
            <Route path="/invoices/*" element={<InvoicesIndex />} />
            <Route path="/invoices/edit/:id" element={<InvoicesEdit />} />
            <Route path="/invoices/show/:id" element={<InvoicesShow />} />

            {/* Delivery Orders (wildcard so TabbedResource routes work) */}
            <Route
              path="/delivery-orders/*"
              element={<DeliveryOrdersIndex />}
            />
            <Route
              path="/delivery-orders/edit/:id"
              element={<DeliveryOrdersEdit />}
            />
            <Route
              path="/delivery-orders/show/:id"
              element={<DeliveryOrdersShow />}
            />

            {/* Debit Notes (wildcard so TabbedResource routes work) */}
            <Route path="/debitnotes/*" element={<DebitNotesIndex />} />
            <Route path="/debitnotes/edit/:id" element={<DebitNotesEdit />} />
            <Route path="/debitnotes/show/:id" element={<DebitNotesShow />} />

            {/* Credit Notes (wildcard so TabbedResource routes work) */}
            <Route path="/creditnotes/*" element={<CreditNotesIndex />} />
            <Route
              path="/creditnotes/edit/:id"
              element={<CreditNotesEdit />}
            />
            <Route
              path="/creditnotes/show/:id"
              element={<CreditNotesShow />}
            />

            {/* Account Statements (use wildcard so TabbedResource routes work)
                - The Index component contains the TabbedResource and will render
                  correct tab based on the subpath (e.g. /account-statements/add).
                - Show/Edit routes remain defined below to render full-page views. */}
            <Route
              path="/account-statements/*"
              element={<AccountStatementsIndex />}
            />
            <Route
              path="/account-statements/edit/:id"
              element={<AccountStatementsEdit />}
            />
            <Route
              path="/account-statements/show/:id"
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

            {/* Administration (wildcard so TabbedResource routes work) */}
            <Route path="/administration/*" element={<AdministrationIndex />} />
            <Route
              path="/administration/edit/:id"
              element={<AdministrationEdit />}
            />
            <Route
              path="/administration/show/:id"
              element={<AdministrationShow />}
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
