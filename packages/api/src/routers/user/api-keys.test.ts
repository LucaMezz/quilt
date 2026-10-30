import { call } from "@orpc/server";
import { describe, expect, it } from "vitest";

import { invalidInput } from "../../testing/errors";
import { HandlerReached, stubContext } from "../../testing/procedures";
import { appRouter } from "../index";

const DAY = 60 * 60 * 24;

function createApiKey(input: { name: string; expiresIn: number }) {
    return call(appRouter.apiKeys.create, input, { context: stubContext() });
}

describe("createApiKey input", () => {
    it.each([DAY, 30 * DAY, 365 * DAY])(
        "accepts expiresIn %i",
        async (expiresIn) => {
            await expect(
                createApiKey({ name: "ci", expiresIn }),
            ).rejects.toBeInstanceOf(HandlerReached);
        },
    );

    it.each([DAY - 1, 365 * DAY + 1, DAY + 0.5])(
        "rejects expiresIn %d",
        async (expiresIn) => {
            await expect(
                createApiKey({ name: "ci", expiresIn }),
            ).rejects.toMatchObject(invalidInput());
        },
    );

    it.each(["ci", "  ci  ", "x".repeat(100)])(
        "accepts the name %j",
        async (name) => {
            await expect(
                createApiKey({ name, expiresIn: DAY }),
            ).rejects.toBeInstanceOf(HandlerReached);
        },
    );

    it.each(["", "   ", "x".repeat(101)])(
        "rejects the name %j",
        async (name) => {
            await expect(
                createApiKey({ name, expiresIn: DAY }),
            ).rejects.toMatchObject(invalidInput());
        },
    );
});

describe("updateApiKey input", () => {
    it.each([{ name: "deploy" }, { enabled: false }])(
        "accepts %j",
        async (changes) => {
            await expect(
                call(
                    appRouter.apiKeys.update,
                    { id: "key", ...changes },
                    { context: stubContext() },
                ),
            ).rejects.toBeInstanceOf(HandlerReached);
        },
    );

    it("rejects a request with neither a name nor an enabled state", async () => {
        await expect(
            call(
                appRouter.apiKeys.update,
                { id: "key" },
                { context: stubContext() },
            ),
        ).rejects.toMatchObject(invalidInput());
    });
});
