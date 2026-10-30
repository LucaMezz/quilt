import { call } from "@orpc/server";
import { describe, expect, it } from "vitest";

import { invalidInput } from "../../testing/errors";
import { HandlerReached, stubContext } from "../../testing/procedures";
import { appRouter } from "../index";

function createOrganization(input: { name: string; slug: string }) {
    return call(appRouter.organizations.create, input, {
        context: stubContext(),
    });
}

describe("createOrganization input", () => {
    it.each(["a", "acme", "acme-corp", "a1", "x".repeat(63)])(
        "accepts the slug %j",
        async (slug) => {
            await expect(
                createOrganization({ name: "Acme", slug }),
            ).rejects.toBeInstanceOf(HandlerReached);
        },
    );

    it.each([
        "",
        "Acme",
        "-acme",
        "acme-",
        "acme_corp",
        "acme corp",
        "x".repeat(64),
    ])("rejects the slug %j", async (slug) => {
        await expect(
            createOrganization({ name: "Acme", slug }),
        ).rejects.toMatchObject(invalidInput());
    });

    it("accepts a name with surrounding whitespace", async () => {
        await expect(
            createOrganization({ name: "  Acme  ", slug: "acme" }),
        ).rejects.toBeInstanceOf(HandlerReached);
    });

    it.each(["", "   ", "x".repeat(101)])(
        "rejects the name %j",
        async (name) => {
            await expect(
                createOrganization({ name, slug: "acme" }),
            ).rejects.toMatchObject(invalidInput());
        },
    );
});

describe("updateOrganization input", () => {
    it.each([{ name: "Acme Corp" }, { slug: "acme-corp" }])(
        "accepts %j",
        async (changes) => {
            await expect(
                call(
                    appRouter.organizations.update,
                    { org: "acme", ...changes },
                    { context: stubContext() },
                ),
            ).rejects.toBeInstanceOf(HandlerReached);
        },
    );

    it("rejects a request with neither a name nor a slug", async () => {
        await expect(
            call(
                appRouter.organizations.update,
                { org: "acme" },
                { context: stubContext() },
            ),
        ).rejects.toMatchObject(invalidInput());
    });
});
