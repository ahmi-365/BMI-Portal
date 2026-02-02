import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ListPage } from "../../../components/common/ListPage";
import Toast from "../../../components/common/Toast";
import { canAccess } from "../../../lib/permissionHelper";
import { rolesAPI } from "../../../services/api";

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
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await rolesAPI.delete(id);
      setToast({ message: "Role deleted successfully", type: "success" });
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
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
        />
      </div>
    </>
  );
}
