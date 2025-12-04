import React, { useState, useEffect } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
  editable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onDataChange?: (newData: T[]) => void;
}

const ExcelTable = <T,>({ columns, data, onDataChange }: TableProps<T>) => {
  const [tableData, setTableData] = useState<T[]>(data);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnKey: keyof T;
  } | null>(null);
  const [tempValue, setTempValue] = useState<string | number>("");

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleDoubleClick = (
    rowIndex: number,
    column: Column<T>,
    currentValue: any
  ) => {
    if (column.accessorKey && column.editable !== false) {
      setEditingCell({ rowIndex, columnKey: column.accessorKey });
      setTempValue(currentValue);
    }
  };

  const handleSave = () => {
    if (editingCell) {
      const newData = [...tableData];
      newData[editingCell.rowIndex] = {
        ...newData[editingCell.rowIndex],
        [editingCell.columnKey]: tempValue,
      };

      setTableData(newData);
      setEditingCell(null);

      if (onDataChange) {
        onDataChange(newData);
      }
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.length > 0 ? (
              tableData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  {columns.map((col, colIndex) => {
                    const isEditing =
                      editingCell?.rowIndex === rowIndex &&
                      editingCell?.columnKey === col.accessorKey;

                    const cellValue = col.accessorKey
                      ? (row[col.accessorKey] as React.ReactNode)
                      : null;

                    return (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        onDoubleClick={() =>
                          handleDoubleClick(rowIndex, col, cellValue)
                        }
                        className={`px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${
                          col.accessorKey ? "cursor-pointer" : ""
                        }`}
                      >
                        {isEditing ? (
                          <input
                            autoFocus
                            type="text"
                            value={tempValue as string}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                            className="w-full -ml-2 px-2 py-1 rounded bg-white dark:bg-white/[0.05] border border-brand-500 outline-none text-gray-800 dark:text-white/90 text-theme-sm"
                          />
                        ) : col.render ? (
                          col.render(row)
                        ) : (
                          cellValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-8 text-center text-gray-500 text-theme-sm dark:text-gray-400"
                >
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelTable;