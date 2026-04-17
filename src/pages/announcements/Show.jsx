import { ShowPage } from "../../components/common/ShowPage";
import { formatDate } from "../../lib/dateUtils";
import { announcementsAPI } from "../../services/api";

const statusRender = (value) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
      value === true || value === "true" || value === 1 || value === "1"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {value === true || value === "true" || value === 1 || value === "1"
      ? "Published"
      : "Draft"}
  </span>
);

const FIELDS = [
  { name: "subject", label: "Subject" },
  {
    name: "content",
    label: "Content",
    render: (value) => (
      <div className="whitespace-pre-wrap leading-6 text-gray-900 dark:text-white">
        {value || "-"}
      </div>
    ),
  },
  {
    name: "status",
    label: "Status",
    render: statusRender,
  },
  {
    name: "created_at",
    label: "Created At",
    render: (value) => formatDate(value),
  },
  {
    name: "updated_at",
    label: "Updated At",
    render: (value) => formatDate(value),
  },
];

export default function AnnouncementsShow() {
  return (
    <ShowPage
      resourceName="announcements"
      fields={FIELDS}
      title="Announcement"
      showDelete
      onDelete={(id) => announcementsAPI.delete(id)}
    />
  );
}
