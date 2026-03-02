import * as React from "react";

// Allow native HTML attributes (like onClick) on table elements
type NativeProps<T> = React.HTMLAttributes<T> & { className?: string };

// Table Component
export const Table: React.FC<NativeProps<HTMLTableElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <table className={`min-w-full ${className}`} {...props}>
      {children}
    </table>
  );
};

// TableHeader Component
export const TableHeader: React.FC<NativeProps<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

// TableBody Component
export const TableBody: React.FC<NativeProps<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

// TableRow Component (FIXED: now supports onClick)
export const TableRow: React.FC<NativeProps<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
};

// TableCell Component (FIXED: supports onClick)
interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  isHeader?: boolean;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  ...props
}) => {
  const CellTag = isHeader ? "th" : "td";

  return (
    <CellTag className={className} {...props}>
      {children}
    </CellTag>
  );
};
