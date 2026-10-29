import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteToken, getToken, saveToken } from "./credentials";

const keychain = vi.hoisted(() => new Map<string, string>());

vi.mock("@napi-rs/keyring", () => ({
    Entry: class {
        key: string;
        constructor(service: string, account: string) {
            this.key = `${service}/${account}`;
        }
        getPassword() {
            return keychain.get(this.key) ?? null;
        }
        setPassword(password: string) {
            keychain.set(this.key, password);
        }
        deletePassword() {
            return keychain.delete(this.key);
        }
    },
}));

beforeEach(() => {
    keychain.clear();
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
});
