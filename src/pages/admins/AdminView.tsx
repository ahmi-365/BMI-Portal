import { Eye, Pencil, Trash } from "lucide-react";
import Table, { Column } from "../../components/ui/table/Table"; 

interface AdminUser {
  id: number;
  name: string;
  email: string;
  mailable: boolean;
  createdAt: string;
}

const AdminView = () => {
  const adminUsers: AdminUser[] = [
    {
      id: 1,
      name: "Musharof Chy",
      email: "musharof@example.com",
      mailable: true,
      createdAt: "Dec 01, 2024",
    },
    {
      id: 2,
      name: "Naimur Rahman",
      email: "naimur@example.com",
      mailable: false,
      createdAt: "Dec 02, 2024",
    },
    {
      id: 3,
      name: "Shafiqul Islam",
      email: "shafiqul@example.com",
      mailable: true,
      createdAt: "Dec 03, 2024",
    },
  ];

  const columns: Column<AdminUser>[] = [
   
    {
      header: "Name",
      accessorKey: "name",
      render: (user) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {user.name}
        </span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Mailable",
      accessorKey: "mailable",
      render: (user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.mailable
              ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {user.mailable ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
    },
     {
      header: "Actions",
      render: () => (
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Admin Users
        </h2>
        <button className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-6 xl:px-8">
          Add New Admin
        </button>
      </div>

      <div className="flex flex-col gap-10">
        <Table columns={columns} data={adminUsers} />
      </div>
    </div>
  );
};

export default AdminView;