import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@quilt/ui/components/table";

import {
  accessSummary,
  expiresSoon,
  keyStatus,
  writableResources,
} from "@/lib/api-keys/describe";
import type { ApiKey } from "@/lib/api-keys/use-api-keys";
import { relativeTime } from "@/lib/relative-time";

import { AccessBadge, ExpiresSoonBadge, StatusBadge } from "./key-badges";

function When({ date, never }: { date: Date | null; never: string }) {
  if (!date) return <span className="text-muted-foreground">{never}</span>;
  return (
    <time dateTime={date.toISOString()} title={date.toLocaleString()}>
      {relativeTime(date)}
    </time>
  );
}

export function ApiKeyTable({ keys }: { keys: ApiKey[] }) {
  return (
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
            <TableRow key={key.id}>
              <th
                scope="row"
                className="p-2 text-left align-middle font-normal"
              >
                <span className="block font-medium">
                  {key.name ?? "Unnamed key"}
                </span>
                {key.start && (
                  <code className="text-muted-foreground text-xs">
                    {key.start}…
                  </code>
                )}
              </th>
              <TableCell>
                <StatusBadge status={keyStatus(key)} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <AccessBadge level={access} />
                  {writes.length > 0 && (
                    <span className="text-muted-foreground text-xs">
                      Writes {writes.join(", ")}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <When date={key.expiresAt} never="Never" />
                  {expiresSoon(key) && <ExpiresSoonBadge />}
                </div>
              </TableCell>
              <TableCell>
                <When date={key.lastRequest} never="Never used" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
