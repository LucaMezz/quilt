import { Button } from "@quilt/ui/components/button";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { expiresSoon, keyStatus } from "@/lib/api-keys/describe";
import { type ApiKey, useSetApiKeyEnabled } from "@/lib/api-keys/use-api-keys";

function longDate(date: Date) {
  return date.toLocaleDateString(undefined, { dateStyle: "long" });
}

function explain(apiKey: ApiKey) {
  const status = keyStatus(apiKey);
  if (status === "expired" && apiKey.expiresAt) {
    return `This key expired on ${longDate(apiKey.expiresAt)}, so requests made with it are rejected. Regenerate it to use it again.`;
  }
  if (status === "disabled") {
    return "Requests made with this key are rejected until you enable it again.";
  }
  if (!apiKey.expiresAt) {
    return "Requests made with this key are accepted. It never expires.";
  }
  if (expiresSoon(apiKey)) {
    return `Requests made with this key are accepted, but it expires on ${longDate(apiKey.expiresAt)}. Regenerate it to keep using it.`;
  }
  return `Requests made with this key are accepted until it expires on ${longDate(apiKey.expiresAt)}.`;
}

export function KeyStatusSection({ apiKey }: { apiKey: ApiKey }) {
  const setEnabled = useSetApiKeyEnabled();
  const status = keyStatus(apiKey);
  const name = apiKey.name ?? "this key";

  return (
    <SectionCard
      level={3}
      title="Status"
      description={explain(apiKey)}
      action={
        status === "expired" ? undefined : apiKey.enabled ? (
          <Button
            variant="outline"
            onClick={() => {
              setEnabled(apiKey.id, false);
              toast.success(`Disabled API key ${name}`);
            }}
          >
            Disable key
          </Button>
        ) : (
          <Button
            onClick={() => {
              setEnabled(apiKey.id, true);
              toast.success(`Enabled API key ${name}`);
            }}
          >
            Enable key
          </Button>
        )
      }
    />
  );
}
