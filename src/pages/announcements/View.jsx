import { ListPage } from "../../components/common/ListPage";
import { formatDate } from "../../lib/dateUtils";
import { announcementsAPI } from "../../services/api";

const truncateContent = (content) => {
  if (!content) return "-";
  return content.length > 90 ? `${content.slice(0, 90)}...` : content;
};

const isPublished = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

const COLUMNS = [
  {
    header: "Subject",
    accessor: "subject",
    filterKey: "subject",
    sortable: true,
    render: (row) => row.subject || row.title || "-",
  },
  {
    header: "Content",
    accessor: "content",
    filterKey: "content",
    sortable: false,
    render: (row) => truncateContent(row.content),
  },
  {
    header: "Status",
    accessor: "status",
    filterKey: "status",
    sortable: true,
    render: (row) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          isPublished(row.status)
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {isPublished(row.status) ? "Published" : "Draft"}
      </span>
    ),
  },
  {
    header: "Created At",
    accessor: "created_at",
    filterKey: "created_at",
    sortable: true,
    render: (row) => formatDate(row.created_at || row.createdAt),
  },
];

export default function AnnouncementsView() {
  return (
    <ListPage
      resourceName="announcements"
      columns={COLUMNS}
      title="Announcements"
      subtitle="Create, edit, view, and delete announcements"
      basePath="/announcements"
      showEdit
      showDelete
      onDelete={(id) => announcementsAPI.delete(id)}
    />
  );
}
