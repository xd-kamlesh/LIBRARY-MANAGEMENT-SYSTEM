import React from 'react';
import clsx from 'clsx';
import './Table.css';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> { }

export const Table: React.FC<TableProps> = ({ className, children, ...props }) => {
    return (
        <div className="table-container glass-panel">
            <table className={clsx('premium-table', className)} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
    <thead className="table-header" {...props}>
        {children}
    </thead>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, children, ...props }) => (
    <tr className={clsx('table-row', className)} {...props}>
        {children}
    </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
    <th className={clsx('table-head', className)} {...props}>
        {children}
    </th>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
    <tbody className="table-body" {...props}>
        {children}
    </tbody>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, children, ...props }) => (
    <td className={clsx('table-cell', className)} {...props}>
        {children}
    </td>
);
