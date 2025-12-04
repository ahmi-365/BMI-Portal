import Form from "../../components/common/Form"; // Adjust path

const AdminCreate = () => {
  const handleSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Check console for data");
  };

  const formFields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
      required: true,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "Admin", label: "Super Admin" },
        { value: "Editor", label: "Editor" },
        { value: "Viewer", label: "Viewer" },
      ],
      required: true,
      defaultValue: "Editor",
    },
    {
      name: "bio",
      label: "Bio / Description",
      type: "textarea",
      placeholder: "Type your message",
    },
    {
      name: "mailable",
      label: "Mailable Status",
      type: "toggle",
      placeholder: "Receive email notifications and updates",
      defaultValue: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          Add New Admin
        </h2>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="font-medium text-black dark:text-white">
            Personal Information
          </h3>
        </div>

        <div className="p-6">
          <Form
            fields={formFields}
            onSubmit={handleSubmit}
            submitLabel="Create Admin"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminCreate;
