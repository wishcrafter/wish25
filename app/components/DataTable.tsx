'use client';

import React from 'react';

export interface ColumnMapping {
  [key: string]: string;
}

export interface DataTableProps<T> {
  data: T[];
  columnMapping: ColumnMapping;
  className?: string;
  emptyMessage?: string;
  formatters?: {
    [K in keyof T]?: (value: T[K], row: T) => React.ReactNode;
  };
  onRowClick?: (row: T) => void;
  highlightedRowIds?: (string | number)[];
  rowIdKey?: keyof T;
  columnStyles?: {
    [K in keyof ColumnMapping]?: string;
  };
}

export default function DataTable<T extends { [key: string]: any }>({
  data,
  columnMapping,
  className = '',
  emptyMessage = '데이터가 없습니다.',
  formatters = {},
  onRowClick,
  highlightedRowIds = [],
  rowIdKey,
  columnStyles = {}
}: DataTableProps<T>) {
  // 데이터가 없는 경우
  if (!data.length) {
    return (
      <div className="data-table-container">
        <div className="empty-state">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      <table className="data-table">
        <thead>
          <tr>
            {Object.entries(columnMapping).map(([key, label]) => (
              <th 
                key={key} 
                className={columnStyles[key] || ''}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            // 행 하이라이트 여부 확인
            const isHighlighted = rowIdKey && 
              highlightedRowIds.includes(item[rowIdKey]);

            return (
              <tr 
                key={rowIdKey ? String(item[rowIdKey]) : index}
                className={isHighlighted ? 'highlight-row' : ''}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {Object.keys(columnMapping).map((key) => {
                  const value = item[key];
                  const formatter = formatters[key as keyof T];
                  
                  return (
                    <td 
                      key={key}
                      className={columnStyles[key] || ''}
                    >
                      {formatter 
                        ? formatter(value, item) 
                        : (value !== undefined && value !== null 
                            ? String(value) 
                            : '-')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 