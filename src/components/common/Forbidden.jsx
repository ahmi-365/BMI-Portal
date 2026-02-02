import { AlertCircle } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center  flex-col gap-6 p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          403
        </h1>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Access Denied
        </h2>

        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to access this resource. Please contact your
          administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
