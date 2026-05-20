import React from 'react';

export interface TableColumn {
  title: string;
  dataIndex: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export interface TableProps<T = any> {
  columns: TableColumn[];
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  striped?: boolean;
  showHeader?: boolean;
  loading?: boolean;
  emptyText?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Table = <T extends Record<string, any>>({
  columns,
  dataSource,
  rowKey = 'key',
  striped = true,
  showHeader = true,
  loading = false,
  emptyText = '暂无数据',
  className = '',
  style = {},
}: TableProps<T>) => {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || `${index}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#19c8b9] border-t-transparent"></div>
      </div>
    );
  }

  if (dataSource.length === 0) {
    return (
      <div className="text-center py-12 text-[#9f927d]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`} style={style}>
      <table className="w-full border-collapse">
        {showHeader && (
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  style={{ width: column.width }}
                  className={`px-4 py-3 text-left font-bold text-[#794f27] border-b-2 border-[#c4b89e] ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {dataSource.map((record, rowIndex) => (
            <tr
              key={getRowKey(record, rowIndex)}
              className={striped && rowIndex % 2 === 1 ? 'bg-[#f0ece2]' : ''}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-4 py-3 border-b border-[#c4b89e]/30 ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {column.render 
                    ? column.render(record[column.dataIndex], record, rowIndex)
                    : record[column.dataIndex]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
