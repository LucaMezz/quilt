import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";
import { Link } from "@tanstack/react-router";

import { expiresSoon, keyStatus } from "@/lib/api-keys/describe";
import type { ApiKey } from "@/lib/api-keys/use-api-keys";

import { ExpiresSoonBadge, StatusBadge } from "./key-badges";
import { When } from "./when";

export function ApiKeyTable({ keys }: { keys: ApiKey[] }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label="API keys" className="text-sm">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col">Key</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Created</TableHead>
            <TableHead scope="col">Last used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((key) => (
            <TableRow key={key.id} className="relative">
              <th scope="row" className="px-4 py-3 text-left font-normal">
                <Link
                  to="/settings/api-keys/$keyId"
                  params={{ keyId: key.id }}
                  className="font-medium text-base outline-none after:absolute after:inset-0 after:rounded-sm hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {key.name ?? "Unnamed key"}
                </Link>
              </th>
              <TableCell>
                <code className="text-muted-foreground">
                  {key.start ? `${key.start}…` : "Hidden"}
                </code>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1">
                  <StatusBadge status={keyStatus(key)} />
                  {expiresSoon(key) && <ExpiresSoonBadge />}
                </div>
              </TableCell>
              <TableCell>
                <When date={key.createdAt} never="Unknown" />
              </TableCell>
              <TableCell>
                <When date={key.lastRequest} never="Never used" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
