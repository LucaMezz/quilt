import { CollectionTable, type Column } from "./collection-table";
import type { View } from "./views";

type RenderItem<T> = (item: T) => React.ReactNode;

export function Collection<T>({
  view,
  label,
  items,
  getKey,
  empty,
  grid,
  list,
  table,
}: {
  view: View;
  label: string;
  items: readonly T[];
  getKey: (item: T) => string;
  empty: React.ReactNode;
  grid?: RenderItem<T>;
  list?: RenderItem<T>;
  table?: readonly Column<T>[];
}) {
  if (items.length === 0) return empty;

  if (view === "table" && table) {
    return (
      <CollectionTable
        label={label}
        items={items}
        getKey={getKey}
        columns={table}
      />
    );
  }

  const render = view === "list" ? (list ?? grid) : (grid ?? list);
  if (!render) return null;

  return (
    <ul
      aria-label={label}
      className={
        render === list
          ? "flex flex-col divide-y overflow-hidden rounded-lg border bg-card"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((item) => (
        <li key={getKey(item)} className="relative">
          {render(item)}
        </li>
      ))}
    </ul>
  );
}
