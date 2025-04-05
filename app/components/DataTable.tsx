'use client';

import { ColumnMapping } from '../types';
import { formatEmptyValue } from '../utils/format';

interface DataTableProps<T> {
  data: T[];
  columnMapping: ColumnMapping;
  formatters?: {
    [K in keyof T]?: (value: T[K]) => string;
  };
}

export function DataTable<T extends { [key: string]: any }>({
  data,
  columnMapping,
  formatters = {}
}: DataTableProps<T>) {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {Object.entries(columnMapping).map(([key, label]) => (
            <th key={key}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            {Object.keys(columnMapping).map((key) => {
              const value = item[key];
              const formatter = formatters[key as keyof T];
              const formattedValue = formatter ? formatter(value) : value;
              return (
                <td key={key}>
                  {formattedValue !== undefined ? formatEmptyValue(String(formattedValue)) : '-'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
} 