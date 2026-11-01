import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

export type Column<T> = {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortValue?: (item: T) => string | number;
  rowHeader?: boolean;
};

type Sort = { key: string; direction: "ascending" | "descending" };

export function CollectionTable<T>({
  label,
  items,
  getKey,
  columns,
}: {
  label: string;
  items: readonly T[];
  getKey: (item: T) => string;
  columns: readonly Column<T>[];
}) {
  const [sort, setSort] = useState<Sort>();
  const sortColumn = columns.find((column) => column.key === sort?.key);
  const rows = sortColumn?.sortValue
    ? sortBy(items, sortColumn.sortValue, sort?.direction)
    : items;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label={label} className="text-sm">
        <TableHeader>
          <TableRow>
            {columns.map((column) => {
              const direction =
                sort?.key === column.key ? sort.direction : undefined;
              return (
                <TableHead key={column.key} scope="col" aria-sort={direction}>
                  {column.sortValue ? (
                    <button
                      type="button"
                      className="-mx-1 inline-flex items-center gap-1 rounded-sm px-1 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() =>
                        setSort({
                          key: column.key,
                          direction:
                            direction === "ascending"
                              ? "descending"
                              : "ascending",
                        })
                      }
                    >
                      {column.header}
                      <SortIcon direction={direction} />
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => (
            <TableRow key={getKey(item)} className="relative">
              {columns.map((column) =>
                column.rowHeader ? (
                  <th
                    key={column.key}
                    scope="row"
                    className="px-4 py-3 text-left font-normal"
                  >
                    {column.cell(item)}
                  </th>
                ) : (
                  <TableCell key={column.key}>{column.cell(item)}</TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SortIcon({ direction }: { direction?: Sort["direction"] }) {
  const Icon =
    direction === "ascending"
      ? ArrowUpIcon
      : direction === "descending"
        ? ArrowDownIcon
        : ChevronsUpDownIcon;
  return <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />;
}

function sortBy<T>(
  items: readonly T[],
  value: (item: T) => string | number,
  direction: Sort["direction"] = "ascending",
) {
  const sign = direction === "ascending" ? 1 : -1;
  return [...items].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    const order =
      typeof left === "string" && typeof right === "string"
        ? left.localeCompare(right)
        : Number(left) - Number(right);
    return order * sign;
  });
}
