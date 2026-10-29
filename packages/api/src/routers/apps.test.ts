import { call } from "@orpc/server";
import { describe, expect, it } from "vitest";

import { invalidInput } from "../testing/errors";
import { HandlerReached, stubContext } from "../testing/procedures";
import { appRouter } from "./index";

function createApp(name: string) {
    return call(
        appRouter.createApp,
        { org: "acme", name },
        { context: stubContext() },
    );
}

describe("createApp input", () => {
    it.each(["a", "web", "my-app", "app1", "x".repeat(63)])(
        "accepts the name %j",
        async (name) => {
            await expect(createApp(name)).rejects.toBeInstanceOf(
                HandlerReached,
            );
        },
    );

    it.each(["", "Web", "-web", "web-", "my_app", "my.app", "x".repeat(64)])(
        "rejects the name %j",
        async (name) => {
            await expect(createApp(name)).rejects.toMatchObject(invalidInput());
        },
    );
});
