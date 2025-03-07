import { HTMLAttributes } from 'react'
import { cn } from "@/utils/cn"
import { Loader2 } from 'lucide-react'

interface TableProps extends HTMLAttributes<HTMLTableElement> { }
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> { }
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> { }
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> { }
interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> { }
interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  colSpan?: number
}

export function Table({ className, ...props }: TableProps) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}

export function TableBody({ className, loading, ...props }: TableBodyProps & { loading?: boolean }) {
  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={100} className="text-center">
            <div className="flex justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </td>
        </tr>
      </tbody>
    )
  }
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <tr className={cn("border-b transition-colors", className)} {...props} />
}

export function TableHead({ className, ...props }: TableHeadProps) {
  return <th className={cn("h-12 px-4 text-left align-middle font-medium", className)} {...props} />
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <td className={cn("p-4 align-middle", className)} {...props} />
} 