import { call } from "@orpc/server";
import { describe, expect } from "vitest";

import { declaredError } from "../../testing/errors";
import { test } from "../../testing/fixtures";
import { notAnImage } from "../../testing/images";
import { appRouter } from "../index";

describe("setUserImage", () => {
    test("responds with BAD_REQUEST when the file isn't an image", async ({
        signUp,
        contextFor,
    }) => {
        const caller = await signUp();

        const result = call(
            appRouter.user.setImage,
            { image: notAnImage() },
            { context: await contextFor(caller.headers) },
        );

        await expect(result).rejects.toMatchObject(
            declaredError("BAD_REQUEST", 400),
        );
    });
});
