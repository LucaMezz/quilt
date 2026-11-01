import {
  ToggleGroup,
  ToggleGroupItem,
} from "@quilt/ui/components/toggle-group";
import { LayoutGridIcon, ListIcon, Rows3Icon } from "lucide-react";

import type { View } from "./views";

const views = {
  grid: { label: "Grid", icon: <LayoutGridIcon /> },
  list: { label: "List", icon: <ListIcon /> },
  table: { label: "Table", icon: <Rows3Icon /> },
} satisfies Record<View, { label: string; icon: React.ReactNode }>;

export function ViewSwitcher({
  options,
  value,
  onValueChange,
}: {
  options: readonly View[];
  value: View;
  onValueChange: (view: View) => void;
}) {
  return (
    <ToggleGroup
      aria-label="View"
      variant="outline"
      spacing={0}
      value={[value]}
      onValueChange={(values) => {
        const next = options.find((option) => values.includes(option));
        if (next) onValueChange(next);
      }}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          aria-label={views[option].label}
          title={views[option].label}
        >
          {views[option].icon}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
