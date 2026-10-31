import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { Entry } from "@napi-rs/keyring";

function entry(host: string) {
    return new Entry("quilt", host);
}

function credentialsFile() {
    const configDir =
        process.env.XDG_CONFIG_HOME ||
        (process.platform === "win32"
            ? (process.env.APPDATA ?? homedir())
            : join(homedir(), ".config"));
    return join(configDir, "quilt", "credentials.json");
}

function readFileTokens(): Record<string, string> {
    try {
        return JSON.parse(readFileSync(credentialsFile(), "utf8"));
    } catch {
        return {};
    }
}

function writeFileTokens(tokens: Record<string, string>) {
    const file = credentialsFile();
    mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
    writeFileSync(file, JSON.stringify(tokens, null, 4), { mode: 0o600 });
}

function getKeychainToken(host: string) {
    try {
        return entry(host).getPassword() ?? undefined;
    } catch {
        return undefined;
    }
}

let apiKeyFlag: string | undefined;

export function setApiKeyFlag(key: string | undefined) {
    apiKeyFlag = key;
}

const PASSED_KEYS = {
    "--api-key": {
        from: "passed with --api-key",
        reason: "--api-key was passed",
        fix: "Leave out --api-key",
    },
    QUILT_TOKEN: {
        from: "in QUILT_TOKEN",
        reason: "QUILT_TOKEN is set",
        fix: "Unset QUILT_TOKEN",
    },
};

export function passedKey() {
    if (apiKeyFlag) return PASSED_KEYS["--api-key"];
    if (process.env.QUILT_TOKEN) return PASSED_KEYS.QUILT_TOKEN;
    return undefined;
}

export function getCredential(host: string) {
    if (apiKeyFlag) {
        return { token: apiKeyFlag, source: "--api-key" } as const;
    }
    if (process.env.QUILT_TOKEN) {
        return {
            token: process.env.QUILT_TOKEN,
            source: "QUILT_TOKEN",
        } as const;
    }
    const keychainToken = getKeychainToken(host);
    if (keychainToken)
        return { token: keychainToken, source: "keychain" } as const;
    const fileToken = readFileTokens()[host];
    if (fileToken) return { token: fileToken, source: "file" } as const;
    return undefined;
}

export function getToken(host: string) {
    return getCredential(host)?.token;
}

export function saveToken(host: string, token: string) {
    try {
        entry(host).setPassword(token);
        return "keychain";
    } catch {
        writeFileTokens({ ...readFileTokens(), [host]: token });
        return "file";
    }
}

export function deleteToken(host: string) {
    try {
        entry(host).deletePassword();
    } catch {}
    const { [host]: deleted, ...rest } = readFileTokens();
    if (deleted !== undefined) writeFileTokens(rest);
}
