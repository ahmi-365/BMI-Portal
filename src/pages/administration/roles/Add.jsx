import { CheckSquare, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { ResourceForm } from "../../../components/common/ResourceForm";
import { permissionsAPI } from "../../../services/api";

export default function RolesAdd() {
  const [permissionOptions, setPermissionOptions] = useState([]);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const res = await permissionsAPI.list();
      const data = res?.data || res || {};

      // Data might be grouped { "Group": [ {name...}, ... ] }
      // Flatten it for the select options
      const allPerms = Array.isArray(data) ? data : Object.values(data).flat();

      const options = allPerms.map((p) => ({
        label: p.name,
        value: p.name,
      }));
      setPermissionOptions(options);
    } catch (err) {
      console.error("Failed to load permissions", err);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Role Name",
      type: "text",
      required: true,
      placeholder: "e.g. Manager",
    },
    {
      name: "permissions",
      label: "Permissions",
      type: "select",
      multiple: true,
      searchable: true,
      options: permissionOptions,
      placeholder: "Select permissions",
      customActions: (formData, setFormData) => (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                permissions: permissionOptions.map((opt) => opt.value),
              }));
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Select All
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                permissions: [],
              }));
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            <Square className="w-4 h-4" />
            Deselect All
          </button>
        </div>
      ),
    },
  ];

  return (
    <ResourceForm
      resourceName="roles"
      title="Add New Role"
      fields={fields}
      redirectPath="/administration/roles"
    />
  );
}
