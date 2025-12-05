import { ListPage } from "../../components/common/ListPage";
import PageMeta from "../../components/common/PageMeta";

const COLUMNS = [
  {
    header: "Name",
    accessor: "name",
    cell: (value) => (
      <span className="font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
    ),
  },
  { header: "Email", accessor: "email" },
  {
    header: "Mailable",
    accessor: "mailable",
    cell: (value) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value
            ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    ),
  },
  { header: "Created At", accessor: "createdAt" },
];

export default function AdministrationView() {
  return (
    <ListPage
      resourceName="administration"
      columns={COLUMNS}
      title="Administration"
      addButtonText="New Administration User"
    />
  );
}
