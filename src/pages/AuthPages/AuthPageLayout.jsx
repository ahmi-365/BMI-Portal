import { ChartBar } from "lucide-react";
import { Link } from "react-router-dom";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
            <Link to="/" className="flex items-center space-x-2">
  {/* Icon */}
  <ChartBar className="h-8 w-8 p-1 bg-blue-600 text-white rounded" />

  {/* Text */}
  <span className="text-xl font-bold text-white">
    BMI{" "}
    <span className="text-sm font-normal text-gray-500">
      – Modern Roofing Tech
    </span>
  </span>
</Link>

              <p className="text-center text-gray-400 dark:text-white/60 mt-8">
                New Horizons in roofing and waterproofing
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
