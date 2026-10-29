import { API_KEY_HEADER } from "@quilt/auth/api-keys";

import { client } from "../client";
import { authClient } from "./auth-client";

export function getKeySession(key: string) {
    return authClient.getSession({
        fetchOptions: { headers: { [API_KEY_HEADER]: key } },
    });
}

export async function revokeApiKey(key: string) {
    const { data } = await getKeySession(key);
    if (data) await client.apiKeys.delete({ id: data.session.id });
}
