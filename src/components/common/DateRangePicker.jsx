import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useEffect, useRef } from "react";


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

  /* Light mode styling for calendar */
  .flatpickr-calendar {
    background: white !important;
    border: 1px solid #e5e7eb !important;
  }

  .flatpickr-months {
    background: white !important;
  }

  .flatpickr-month {
    color: #111827 !important;
  }

  .flatpickr-prev-month,
  .flatpickr-next-month {
    color: #6b7280 !important;
  }

  /* Month/Year dropdown styling - Light mode */
  .flatpickr-monthDropdown-months,
  .flatpickr-monthDropdown-years {
    background: white !important;
    color: #111827 !important;
    border: 1px solid #e5e7eb !important;
  }

  .flatpickr-monthDropdown-months option,
  .flatpickr-monthDropdown-years option {
    background: white !important;
    color: #111827 !important;
  }

  /* Weekday styling */
  .flatpickr-weekday {
    color: #6b7280 !important;
    background: #f9fafb !important;
  }

  /* Day styling */
  .flatpickr-day {
    color: #111827 !important;
  }

  .flatpickr-day.prevMonthDay,
  .flatpickr-day.nextMonthDay {
    color: #d1d5db !important;
  }

  .flatpickr-day:hover {
    background: #e5e7eb !important;
    border-color: #e5e7eb !important;
  }

  /* Dark mode - when dark class is present on body/html */
  html.dark .flatpickr-calendar,
  body.dark .flatpickr-calendar {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
  }

  html.dark .flatpickr-months,
  body.dark .flatpickr-months {
    background: #1f2937 !important;
  }

  html.dark .flatpickr-month,
  body.dark .flatpickr-month {
    color: #f3f4f6 !important;
  }

  html.dark .flatpickr-prev-month,
  html.dark .flatpickr-next-month,
  body.dark .flatpickr-prev-month,
  body.dark .flatpickr-next-month {
    color: #d1d5db !important;
  }

  /* Month/Year dropdown styling - Dark mode */
  html.dark .flatpickr-monthDropdown-months,
  html.dark .flatpickr-monthDropdown-years,
  body.dark .flatpickr-monthDropdown-months,
  body.dark .flatpickr-monthDropdown-years {
    background: #374151 !important;
    color: #f3f4f6 !important;
    border: 1px solid #4b5563 !important;
  }

  html.dark .flatpickr-monthDropdown-months option,
  html.dark .flatpickr-monthDropdown-years option,
  body.dark .flatpickr-monthDropdown-months option,
  body.dark .flatpickr-monthDropdown-years option {
    background: #374151 !important;
    color: #f3f4f6 !important;
  }

  /* Weekday styling - Dark mode */
  html.dark .flatpickr-weekday,
  body.dark .flatpickr-weekday {
    color: #d1d5db !important;
    background: #111827 !important;
  }

  /* Day styling - Dark mode */
  html.dark .flatpickr-day,
  body.dark .flatpickr-day {
    color: #f3f4f6 !important;
  }

  html.dark .flatpickr-day.prevMonthDay,
  html.dark .flatpickr-day.nextMonthDay,
  body.dark .flatpickr-day.prevMonthDay,
  body.dark .flatpickr-day.nextMonthDay {
    color: #6b7280 !important;
  }

  html.dark .flatpickr-day:hover,
  body.dark .flatpickr-day:hover {
    background: #4b5563 !important;
    border-color: #4b5563 !important;
  }
`;

export const DateRangePicker = ({ dateFrom, dateTo, onDateChange, rangeRestriction }) => {
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
          } else if (selectedDates.length === 1 && rangeRestriction) {
            // Set maxDate based on restriction
            const startDate = new Date(selectedDates[0]);
            let maxDate;
            if (rangeRestriction === 'month') {
              maxDate = new Date(startDate);
              maxDate.setDate(maxDate.getDate() + 30);
            } else if (rangeRestriction === 'year') {
              maxDate = new Date(startDate);
              maxDate.setDate(maxDate.getDate() + 365);
            }
            if (maxDate) {
              instance.set('maxDate', maxDate);
            }
          }
        },
        // Show the calendar BELOW the input
        position: "below",
      });
    }

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, [rangeRestriction]);

  useEffect(() => {
    if (fpInstance.current) {
      fpInstance.current.setDate([dateFrom, dateTo], false);
    }
  }, [dateFrom, dateTo]);

  const handleClear = () => {
    if (fpInstance.current) {
      fpInstance.current.clear();
      fpInstance.current.set('maxDate', null);
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
