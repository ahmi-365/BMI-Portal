import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";
import { formatDate } from "../../lib/dateUtils";
import { canAccess } from "../../lib/permissionHelper";

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


const normalizeRoleName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

const collectRoleNames = (value, target) => {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectRoleNames(item, target));
    return;
  }
  if (typeof value === "string") {
    target.push(value);
    return;
  }
  if (typeof value === "object") {
    if (value.name) target.push(value.name);
    if (value.role) collectRoleNames(value.role, target);
  }
};

const isSuperAdminRow = (row) => {
  const flagValues = [
    row?.is_super_admin,
    row?.is_superadmin,
    row?.super_admin,
    row?.superAdmin,
  ];
  if (flagValues.some(Boolean)) return true;

  const roleNames = [];
  collectRoleNames(row?.roles, roleNames);
  collectRoleNames(row?.role, roleNames);
  collectRoleNames(row?.role_name, roleNames);
  collectRoleNames(row?.roleName, roleNames);

  return roleNames.some((name) => normalizeRoleName(name) === "super-admin");
};

const canEditAdmin = (row) => !isSuperAdminRow(row);

const canDeleteAdmin = (row) => !isSuperAdminRow(row);

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
        rowDeleteCondition={canDeleteAdmin}
      />
    </div>
  );
}
