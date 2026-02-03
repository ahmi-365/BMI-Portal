import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ListPage } from "../../../components/common/ListPage";
import Toast from "../../../components/common/Toast";
import { canAccess } from "../../../lib/permissionHelper";
import { rolesAPI } from "../../../services/api";
import { auth } from "../../../services/auth";

const COLUMNS = [
  {
    header: "Role Name",
    accessor: "name",
    sortable: true,
  },
  {
    header: "Guard Name",
    accessor: "guard_name",
    sortable: true,
  },
  {
    header: "Created At",
    accessor: "created_at",
    sortable: true,
    render: (row) => new Date(row.created_at).toLocaleDateString(),
  },
];

export default function RolesIndex() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState({ message: null, type: "success" });

  const handleDelete = async (id) => {
    try {
      await rolesAPI.delete(id);
      setToast({ message: "Role deleted successfully", type: "success" });
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  // Function to check if a role can be edited or deleted
  const canModifyRole = (row) => {
    const roleName = row.name?.toLowerCase();

    // Get current user's roles from localStorage
    const currentUserRoles = auth.getRoles();
    const currentUserRoleNames = currentUserRoles.map((r) => r.toLowerCase());
    const isSuperAdmin = currentUserRoleNames.includes("super-admin");

    // super-admin role cannot be edited or deleted by anyone
    if (roleName === "super-admin") {
      return false;
    }

    // Only super-admin can edit/delete the admin role
    if (roleName === "admin" && !isSuperAdmin) {
      return false;
    }

    // Cannot modify the role that the current user has
    if (currentUserRoleNames.includes(roleName)) {
      return false;
    }

    return true;
  };

  return (
    <>
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "success" })}
        />
      )}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles Management
          </h1>
        </div>
        {canAccess("create-roles") && (
          <Link
            to="/administration/roles/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </Link>
        )}
      </div>
      <div className="relative">
        <ListPage
          resourceName="roles"
          columns={COLUMNS}
          title="Roles Management"
          subtitle="Manage user roles and their permissions"
          basePath="/administration/roles"
          showEdit={canAccess("edit-roles")}
          onDelete={canAccess("delete-roles") ? handleDelete : null}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          rowEditCondition={canModifyRole}
          rowDeleteCondition={canModifyRole}
        />
      </div>
    </>
  );
}
