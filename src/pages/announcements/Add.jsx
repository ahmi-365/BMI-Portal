import { useParams } from "react-router-dom";
import { ResourceForm } from "../../components/common/ResourceForm";
import { announcementsAPI } from "../../services/api";

export default function AnnouncementsAdd() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const normalizeStatus = (value) =>
    value === true || value === "true" || value === 1 || value === "1";

  const FIELDS = [
    {
      name: "subject",
      label: "Subject",
      type: "text",
      required: true,
    },
    {
      name: "content",
      label: "Content",
      type: "textarea",
      required: true,
      colSpan: 2,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Published" },
        { value: "false", label: "Draft" },
      ],
    },
  ];

  const handleSubmit = async (formData) => {
    const payload = {
      ...formData,
      status: normalizeStatus(formData.status),
    };

    if (isEditMode) {
      return await announcementsAPI.update(id, payload);
    }
    return await announcementsAPI.create(payload);
  };

  return (
    <ResourceForm
      resourceName="announcements"
      fields={FIELDS}
      title={isEditMode ? "Edit Announcement" : "New Announcement"}
      onSubmit={handleSubmit}
    />
  );
}
