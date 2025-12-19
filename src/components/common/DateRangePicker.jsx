import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar as CalendarIcon, X } from "lucide-react";

const customFlatpickrStyles = `
  .flatpickr-calendar {
    transform: scale(0.9);
    /* Default origin */
    transform-origin: top left;
  }
  
  /* Fix animation origin when opening above */
  .flatpickr-calendar.arrowBottom {
    transform-origin: bottom left;
  }

  .flatpickr-day.selected, 
  .flatpickr-day.startRange, 
  .flatpickr-day.endRange, 
  .flatpickr-day.selected.inRange, 
  .flatpickr-day.startRange.inRange, 
  .flatpickr-day.endRange.inRange, 
  .flatpickr-day.selected:focus, 
  .flatpickr-day.startRange:focus, 
  .flatpickr-day.endRange:focus, 
  .flatpickr-day.selected:hover, 
  .flatpickr-day.startRange:hover, 
  .flatpickr-day.endRange:hover, 
  .flatpickr-day.selected.prevMonthDay, 
  .flatpickr-day.startRange.prevMonthDay, 
  .flatpickr-day.endRange.prevMonthDay, 
  .flatpickr-day.selected.nextMonthDay, 
  .flatpickr-day.startRange.nextMonthDay, 
  .flatpickr-day.endRange.nextMonthDay {
    background: #2563eb;
    border-color: #2563eb;
  }
  
  .flatpickr-day.inRange {
    box-shadow: -5px 0 0 #60a5fa, 5px 0 0 #60a5fa;
    background: #60a5fa;
    border-color: #60a5fa;
  }
`;

export const DateRangePicker = ({ dateFrom, dateTo, onDateChange }) => {
  const pickerRef = useRef(null);
  const fpInstance = useRef(null);

  useEffect(() => {
    if (pickerRef.current) {
      fpInstance.current = flatpickr(pickerRef.current, {
        mode: "range",
        dateFormat: "Y-m-d",
        defaultDate: [dateFrom, dateTo],
        showMonths: 1,
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length === 2) {
            const fromDate = instance.formatDate(selectedDates[0], "Y-m-d");
            const toDate = instance.formatDate(selectedDates[1], "Y-m-d");

            onDateChange("from", fromDate);
            onDateChange("to", toDate);
          } else if (selectedDates.length === 0) {
            onDateChange("clear", null);
          }
        },
        // CHANGED: Force the calendar to always open ABOVE the input
        position: "above",
      });
    }

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (fpInstance.current) {
      fpInstance.current.setDate([dateFrom, dateTo], false);
    }
  }, [dateFrom, dateTo]);

  const handleClear = () => {
    if (fpInstance.current) {
      fpInstance.current.clear();
    }
    onDateChange("clear", null);
  };

  return (
    <div className="space-y-3">
      <style>{customFlatpickrStyles}</style>

      <div className="relative group">
        <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
          <CalendarIcon className="w-5 h-5" />
        </div>

        <input
          ref={pickerRef}
          type="text"
          placeholder="Select date range..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          readOnly
        />

        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
