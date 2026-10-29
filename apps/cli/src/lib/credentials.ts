import { Entry } from "@napi-rs/keyring";

function entry(host: string) {
    return new Entry("quilt", host);
}

export function getToken(host: string) {
    return entry(host).getPassword() ?? undefined;
}

export function saveToken(host: string, token: string) {
    entry(host).setPassword(token);
}

export function deleteToken(host: string) {
    entry(host).deletePassword();
}
