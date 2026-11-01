import {
  ACCESS_LEVEL_LABELS,
  type AccessLevel,
  API_KEY_RESOURCES,
  type ApiKeyPermissions,
  type ApiKeyResource,
  accessLevel,
  withAccessLevel,
} from "@quilt/auth/permissions";
import { Button } from "@quilt/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@quilt/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@quilt/ui/components/empty";
import { Field, FieldGroup, FieldLabel } from "@quilt/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@quilt/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { grantedResources, ungrantedResources } from "@/lib/api-keys/describe";

type GrantedLevel = Exclude<AccessLevel, "none">;

const LEVELS = (["read", "write"] as const).map((value) => ({
  value,
  label: ACCESS_LEVEL_LABELS[value],
}));

function LevelSelect({
  id,
  label,
  value,
  onChange,
}: {
  id?: string;
  label?: string;
  value: GrantedLevel;
  onChange: (level: GrantedLevel) => void;
}) {
  return (
    <Select
      items={LEVELS}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger id={id} aria-label={label} className="w-36 md:w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEVELS.map((level) => (
          <SelectItem key={level.value} value={level.value}>
            {level.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AddPermission({
  permissions,
  onChange,
}: {
  permissions: ApiKeyPermissions;
  onChange: (permissions: ApiKeyPermissions) => void;
}) {
  const resources = ungrantedResources(permissions);
  const [open, setOpen] = useState(false);
  const [resource, setResource] = useState<ApiKeyResource | null>(null);
  const [level, setLevel] = useState<GrantedLevel>("read");
  const items = resources.map((value) => ({
    value,
    label: API_KEY_RESOURCES[value].label,
  }));
  const chosen = resource ?? resources[0] ?? null;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setResource(null);
      setLevel("read");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={<Button variant="outline" disabled={resources.length === 0} />}
      >
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        Add permission
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a permission</DialogTitle>
          <DialogDescription>
            Choose a resource and how much this key can do with it.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="add-permission-resource">Resource</FieldLabel>
            <Select
              items={items}
              value={chosen}
              onValueChange={(next) => {
                if (next !== null) setResource(next);
              }}
            >
              <SelectTrigger id="add-permission-resource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="add-permission-level">Access</FieldLabel>
            <LevelSelect
              id="add-permission-level"
              value={level}
              onChange={setLevel}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={chosen === null}
            onClick={() => {
              if (chosen === null) return;
              onChange(withAccessLevel(permissions, chosen, level));
              onOpenChange(false);
            }}
          >
            Add permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PermissionList({
  permissions,
  onChange,
  emptyHint,
}: {
  permissions: ApiKeyPermissions;
  onChange: (permissions: ApiKeyPermissions) => void;
  emptyHint: string;
}) {
  const granted = grantedResources(permissions);

  function setLevel(resource: ApiKeyResource, level: AccessLevel) {
    onChange(withAccessLevel(permissions, resource, level));
  }

  return granted.length === 0 ? (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>No permissions</EmptyTitle>
        <EmptyDescription>{emptyHint}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ) : (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label="Permissions" className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Resource</TableHead>
            <TableHead scope="col" className="hidden md:table-cell">
              Allows
            </TableHead>
            <TableHead scope="col">Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {granted.map((resource) => {
            const { label, description } = API_KEY_RESOURCES[resource];
            return (
              <TableRow key={resource}>
                <th
                  scope="row"
                  className="px-4 py-3 text-left align-middle font-medium"
                >
                  {label}
                  <span className="block font-normal text-muted-foreground md:hidden">
                    {description}
                  </span>
                </th>
                <TableCell className="hidden whitespace-normal text-muted-foreground md:table-cell">
                  {description}
                </TableCell>
                <TableCell className="pr-2 md:pr-4">
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <LevelSelect
                      label={`${label} access`}
                      value={
                        accessLevel(permissions, resource) === "write"
                          ? "write"
                          : "read"
                      }
                      onChange={(level) => setLevel(resource, level)}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${label}`}
                      onClick={() => setLevel(resource, "none")}
                    >
                      <Trash2Icon aria-hidden="true" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
