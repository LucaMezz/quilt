import { client } from "../client";
import { log } from "../ui/log";
import { canPrompt, chooseOne } from "../ui/prompt";
import { withSpinner } from "../ui/spinner";
import { theme } from "../ui/theme";
import { allPages } from "./pages";

const SHORT_ID_LENGTH = 7;

type ApiKey = { id: string; name?: string | null };

export function shortId(id: string) {
    return id.slice(0, SHORT_ID_LENGTH);
}

function label(key: ApiKey) {
    return `${key.name ?? "(unnamed)"}  ${theme.muted(shortId(key.id))}`;
}

function ambiguous(message: string, matches: ApiKey[]) {
    log.error(message);
    for (const key of matches) log.hint(label(key));
    log.hint("Use more of the ID to pick one.");
}

async function pick<T extends ApiKey>(keys: T[]) {
    if (keys.length === 0) {
        log.info("You have no API keys");
        return undefined;
    }
    const id = await chooseOne(
        "Which API key?",
        keys.map((key) => ({ name: label(key), value: key.id })),
    );
    if (id === undefined) log.error("Cancelled");
    return keys.find((key) => key.id === id);
}

export async function resolveKey(ref: string | undefined) {
    if (ref === undefined && !canPrompt()) {
        log.error("Pass the name or ID of an API key");
        log.hint(`Run ${theme.brand("quilt keys list")} to see yours.`);
        return undefined;
    }
    const keys = await withSpinner(
        "Loading API keys…",
        allPages((cursor) => client.apiKeys.list({ limit: 100, cursor })),
    );
    if (ref === undefined) return pick(keys);

    const byId = keys.find((key) => key.id === ref);
    if (byId) return byId;

    const byName = keys.filter((key) => key.name === ref);
    if (byName.length > 1) {
        ambiguous(`${byName.length} API keys are named "${ref}"`, byName);
        return undefined;
    }
    if (byName[0]) return byName[0];

    const byPrefix = keys.filter((key) => key.id.startsWith(ref));
    if (byPrefix.length > 1) {
        ambiguous(`"${ref}" matches ${byPrefix.length} API keys`, byPrefix);
        return undefined;
    }
    if (byPrefix[0]) return byPrefix[0];

    log.error(`No API key named or starting with "${ref}"`);
    log.hint(`Run ${theme.brand("quilt keys list")} to see yours.`);
    return undefined;
}
