import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { formatDate } from "../../lib/dateUtils";
import { formatAmount } from "../../lib/currencyUtils";
import { canAccess } from "../../lib/permissionHelper";
import { auth } from "../../services/auth";

const COLUMNS = [
  {
    header: "Name",
    accessor: "name",
    filterKey: "name",
    sortable: true,
    sortValue: (row) => row.name?.toLowerCase() || "",
    render: (row) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {row.name}
      </span>
    ),
  },
  {
    header: "Email",
    accessor: "email",
    filterKey: "email",
    sortable: true,
    sortValue: (row) => row.email?.toLowerCase() || "",
  },
  {
    header: "Mailable",
    accessor: "is_mailable",
    disableFilter: true,
    sortable: true,
    sortValue: (row) => (row.is_mailable ? 1 : 0),
    render: (row) => (row.is_mailable ? "True" : "False"),
  },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "uploaded",
    filterType: "date-range",
    sortable: true,
    sortValue: (row) =>
      row.created_at ? new Date(row.created_at).getTime() : 0,
    render: (row) => formatDate(row.created_at),
  },
];


const canEditAdmin = (row) => {
  // Get current user's roles and ID
  const currentUserRoles = auth.getRoles();
  const currentUserRoleNames = currentUserRoles.map((r) => r.toLowerCase());
  const isSuperAdmin = currentUserRoleNames.includes("super-admin");
  const currentUserId = auth.getUserId();

  // Check if the admin being edited has super-admin role
  const adminRoles = row?.roles || [];
  const hasSuperAdminRole = adminRoles.some(
    (role) => role?.name?.toLowerCase() === "super-admin"
  );

  // Super-admin users can only be edited by other super-admins (not themselves)
  if (hasSuperAdminRole) {
    if (!isSuperAdmin) {
      // Regular admin cannot edit super-admin
      return false;
    }
    if (isSuperAdmin && currentUserId && String(row?.id) === String(currentUserId)) {
      // Super-admin cannot edit themselves
      return false;
    }
  }

  return true;
};

export default function AdminView() {
  return (
    <div>
      <PageMeta
        title="Admin Users - BMI Invoice Management System"
        description="Manage system administrators and their permissions."
      />

      <ListPage
        resourceName="admins"
        columns={COLUMNS}
        title="Admin Users"
        subtitle="Manage and track all system administrators"
        showEdit={canAccess("edit-admins")}
        onDelete={canAccess("delete-admins") ? (id) => console.log("Delete", id) : null}
        rowEditCondition={canEditAdmin}
      />
    </div>
  );
}
