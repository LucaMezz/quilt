import {
  API_KEY_RESOURCES,
  type ApiKeyPermissions,
  type ApiKeyResource,
  accessLevel,
} from "@quilt/auth/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";

import { AccessBadge } from "./key-badges";

const resources = Object.entries(API_KEY_RESOURCES) as [
  ApiKeyResource,
  (typeof API_KEY_RESOURCES)[ApiKeyResource],
][];

export function PermissionsTable({
  permissions,
}: {
  permissions: ApiKeyPermissions;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label="Permissions" className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Resource</TableHead>
            <TableHead scope="col">Allows</TableHead>
            <TableHead scope="col">Access</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map(([resource, { label, description }]) => (
            <TableRow key={resource}>
              <th scope="row" className="p-2 text-left align-top font-medium">
                {label}
              </th>
              <TableCell className="whitespace-normal align-top text-muted-foreground">
                {description}
              </TableCell>
              <TableCell className="align-top">
                <AccessBadge level={accessLevel(permissions, resource)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
