import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full">
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i} className="text-zinc-400 font-medium">
                  <Skeleton className="h-4 w-[100px] bg-zinc-800" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="border-zinc-800/50 hover:bg-zinc-900/50">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    {j === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px] bg-zinc-800" />
                          <Skeleton className="h-3 w-[100px] bg-zinc-800" />
                        </div>
                      </div>
                    ) : j === columnCount - 1 ? (
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-md bg-zinc-800" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full max-w-[120px] bg-zinc-800" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-4 w-[250px] bg-zinc-800" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[80px] bg-zinc-800" />
          <Skeleton className="h-8 w-[80px] bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}
