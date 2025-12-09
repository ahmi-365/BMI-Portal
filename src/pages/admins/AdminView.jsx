import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  {
    header: "Name",
    accessor: "name",
    // FIX: 'row' contains the whole object. Access 'row.name' explicitly.
    render: (row) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {row.name}
      </span>
    ),
  },
  {
    header: "Email",
    accessor: "email",
  },
  
  {
    header: "Created At",
    accessor: "created_at",
    // FIX: Access row.created_at
    render: (row) => 
      row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
  },
];

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
      />
    </div>
  );
}