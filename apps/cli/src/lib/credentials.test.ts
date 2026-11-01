import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    deleteToken,
    getCredential,
    getToken,
    passedKey,
    saveToken,
    setApiKeyFlag,
} from "./credentials";

const keychain = vi.hoisted(() => ({
    entries: new Map<string, string>(),
    available: true,
    check() {
        if (!this.available) throw new Error("No keychain available");
    },
}));

vi.mock("@napi-rs/keyring", () => ({
    Entry: class {
        key: string;
        constructor(service: string, account: string) {
            this.key = `${service}/${account}`;
        }
        getPassword() {
            keychain.check();
            return keychain.entries.get(this.key) ?? null;
        }
        setPassword(password: string) {
            keychain.check();
            keychain.entries.set(this.key, password);
        }
        deletePassword() {
            keychain.check();
            return keychain.entries.delete(this.key);
        }
    },
}));

let configDir: string;

beforeEach(() => {
    keychain.entries.clear();
    keychain.available = true;
    configDir = mkdtempSync(join(tmpdir(), "quilt-credentials-"));
    vi.stubEnv("XDG_CONFIG_HOME", configDir);
    vi.stubEnv("QUILT_API_KEY", undefined);
});

afterEach(() => {
    vi.unstubAllEnvs();
    setApiKeyFlag(undefined);
    rmSync(configDir, { recursive: true, force: true });
});

describe("credentials", () => {
    it("has no token before one is saved", () => {
        expect(getToken("quilt.test")).toBeUndefined();
    });

    it("returns the saved token", () => {
        saveToken("quilt.test", "token");

        expect(getToken("quilt.test")).toBe("token");
    });

    it("keeps each server's token separate", () => {
        saveToken("one.test", "first");
        saveToken("two.test", "second");

        expect(getToken("one.test")).toBe("first");
        expect(getToken("two.test")).toBe("second");
    });

    it("forgets a deleted token", () => {
        saveToken("quilt.test", "token");

        deleteToken("quilt.test");

        expect(getToken("quilt.test")).toBeUndefined();
    });

    it("prefers QUILT_API_KEY over the saved token", () => {
        vi.stubEnv("QUILT_API_KEY", "from-env");
        saveToken("quilt.test", "saved");

        expect(getToken("quilt.test")).toBe("from-env");
    });

    it("says where each token comes from", () => {
        saveToken("quilt.test", "saved");

        expect(getCredential("quilt.test")).toEqual({
            token: "saved",
            source: "keychain",
        });
        expect(getCredential("other.test")).toBeUndefined();

        vi.stubEnv("QUILT_API_KEY", "from-env");
        expect(getCredential("quilt.test")).toEqual({
            token: "from-env",
            source: "QUILT_API_KEY",
        });
    });

    it("prefers the --api-key flag over QUILT_API_KEY and the saved token", () => {
        vi.stubEnv("QUILT_API_KEY", "from-env");
        saveToken("quilt.test", "saved");
        setApiKeyFlag("from-flag");

        expect(getCredential("quilt.test")).toEqual({
            token: "from-flag",
            source: "--api-key",
        });
    });

    it("says how to stop using a passed-in key", () => {
        saveToken("quilt.test", "saved");
        expect(passedKey()).toBeUndefined();

        vi.stubEnv("QUILT_API_KEY", "from-env");
        expect(passedKey()?.fix).toBe("Unset QUILT_API_KEY");

        setApiKeyFlag("from-flag");
        expect(passedKey()?.fix).toBe("Leave out --api-key");
    });

    describe("without a keychain", () => {
        beforeEach(() => {
            keychain.available = false;
        });

        it("saves the token to a file instead", () => {
            expect(saveToken("quilt.test", "token")).toBe("file");

            expect(getCredential("quilt.test")).toEqual({
                token: "token",
                source: "file",
            });
        });

        it("forgets a deleted token", () => {
            saveToken("quilt.test", "token");
            saveToken("other.test", "other");

            deleteToken("quilt.test");

            expect(getToken("quilt.test")).toBeUndefined();
            expect(getToken("other.test")).toBe("other");
        });

        it.skipIf(process.platform === "win32")(
            "makes the file readable only by its owner",
            () => {
                saveToken("quilt.test", "token");

                const file = join(configDir, "quilt", "credentials.json");
                expect(statSync(file).mode & 0o777).toBe(0o600);
            },
        );
    });
});
