import { call } from "@orpc/server";
import { describe, expect } from "vitest";

import { declaredError } from "../../testing/errors";
import { test } from "../../testing/fixtures";
import { appRouter } from "../index";

const othersKeyTest = test.extend("othersKey", async ({ auth, signUp }) => {
    const owner = await signUp("owner");
    return auth.api.createApiKey({
        body: { name: "ci" },
        headers: owner.headers,
    });
});

describe("getApiKey", () => {
    othersKeyTest(
        "responds with NOT_FOUND for another user's key",
        async ({ signUp, contextFor, othersKey }) => {
            const intruder = await signUp("intruder");

            const result = call(
                appRouter.apiKeys.get,
                { id: othersKey.id },
                { context: await contextFor(intruder.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );
});

describe("updateApiKey", () => {
    othersKeyTest(
        "responds with NOT_FOUND for another user's key",
        async ({ signUp, contextFor, othersKey }) => {
            const intruder = await signUp("intruder");

            const result = call(
                appRouter.apiKeys.update,
                { id: othersKey.id, enabled: false },
                { context: await contextFor(intruder.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );
});

describe("deleteApiKey", () => {
    othersKeyTest(
        "responds with NOT_FOUND for another user's key",
        async ({ signUp, contextFor, othersKey }) => {
            const intruder = await signUp("intruder");

            const result = call(
                appRouter.apiKeys.delete,
                { id: othersKey.id },
                { context: await contextFor(intruder.headers) },
            );

            await expect(result).rejects.toMatchObject(
                declaredError("NOT_FOUND", 404),
            );
        },
    );
});
