import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";
import { Link } from "@tanstack/react-router";

import {
  accessSummary,
  expiresSoon,
  keyStatus,
  writableResources,
} from "@/lib/api-keys/describe";
import type { ApiKey } from "@/lib/api-keys/use-api-keys";

import { AccessBadge, ExpiresSoonBadge, StatusBadge } from "./key-badges";
import { When } from "./when";

export function ApiKeyTable({ keys }: { keys: ApiKey[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label="API keys" className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Key</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Access</TableHead>
            <TableHead scope="col">Expires</TableHead>
            <TableHead scope="col">Last used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => {
            const access = accessSummary(key.permissions);
            const writes = writableResources(key.permissions);
            return (
              <TableRow key={key.id} className="relative">
                <th scope="row" className="p-2 text-left align-top font-normal">
                  <Link
                    to="/settings/api-keys/$keyId"
                    params={{ keyId: key.id }}
                    className="block font-medium text-base outline-none after:absolute after:inset-0 after:rounded-sm hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring"
                  >
                    {key.name ?? "Unnamed key"}
                  </Link>
                  {key.start && (
                    <code className="text-muted-foreground text-sm">
                      {key.start}…
                    </code>
                  )}
                  {key.description && (
                    <p className="max-w-64 truncate text-muted-foreground text-sm">
                      {key.description}
                    </p>
                  )}
                </th>
                <TableCell className="align-top">
                  <div className="flex flex-wrap items-center gap-1">
                    <StatusBadge status={keyStatus(key)} />
                    {expiresSoon(key) && <ExpiresSoonBadge />}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col items-start gap-1">
                    <AccessBadge level={access} />
                    {writes.length > 0 && (
                      <span className="whitespace-normal text-muted-foreground text-sm">
                        Writes {writes.join(", ")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <When date={key.expiresAt} never="Never" />
                </TableCell>
                <TableCell className="align-top">
                  <When date={key.lastRequest} never="Never used" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
