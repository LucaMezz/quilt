import { call } from "@orpc/server";
import fc from "fast-check";
import { describe, expect } from "vitest";

import type { Context } from "#/context";
import { appRouter } from "#/routers/index";
import { truncateAllTables } from "#/testing/database";
import { test } from "#/testing/fixtures";

const USERS = 3;
const SLUGS = ["acme", "globex", "initech"] as const;

type Model = {
    orgs: Map<string, { name: string; members: Set<number> }>;
};
type Real = { contexts: Context[] };
type OrgCommand = fc.AsyncCommand<Model, Real>;

function contextOf(real: Real, user: number) {
    const context = real.contexts[user];
    if (!context) throw new Error(`No context for user ${user}`);
    return { context };
}

function memberOrg(model: Model, user: number, slug: string) {
    const org = model.orgs.get(slug);
    return org?.members.has(user) ? org : undefined;
}

async function rejectsWith(result: Promise<unknown>, code: string) {
    await expect(result).rejects.toMatchObject({ code, defined: true });
}

class CreateOrg implements OrgCommand {
    constructor(
        readonly user: number,
        readonly slug: string,
        readonly name: string,
    ) {}
    check = () => true;
    async run(model: Model, real: Real) {
        const result = call(
            appRouter.organizations.create,
            { name: this.name, slug: this.slug },
            contextOf(real, this.user),
        );
        if (model.orgs.has(this.slug)) {
            await rejectsWith(result, "CONFLICT");
            return;
        }
        const name = this.name.trim();
        await expect(result).resolves.toMatchObject({ slug: this.slug, name });
        model.orgs.set(this.slug, { name, members: new Set([this.user]) });
    }
    toString = () =>
        `create(user${this.user}, ${this.slug}, ${JSON.stringify(this.name)})`;
}

class GetOrg implements OrgCommand {
    constructor(
        readonly user: number,
        readonly slug: string,
    ) {}
    check = () => true;
    async run(model: Model, real: Real) {
        const result = call(
            appRouter.organizations.get,
            { org: this.slug },
            contextOf(real, this.user),
        );
        const org = memberOrg(model, this.user, this.slug);
        if (!org) {
            await rejectsWith(result, "NOT_FOUND");
            return;
        }
        await expect(result).resolves.toMatchObject({
            slug: this.slug,
            name: org.name,
        });
    }
    toString = () => `get(user${this.user}, ${this.slug})`;
}

class ListOrgs implements OrgCommand {
    constructor(readonly user: number) {}
    check = () => true;
    async run(model: Model, real: Real) {
        const orgs = await call(
            appRouter.organizations.list,
            undefined,
            contextOf(real, this.user),
        );
        const expected = [...model.orgs]
            .filter(([, org]) => org.members.has(this.user))
            .map(([slug, org]) => ({ slug, name: org.name }));
        const actual = orgs.map(({ slug, name }) => ({ slug, name }));
        const bySlug = (a: { slug: string }, b: { slug: string }) =>
            a.slug.localeCompare(b.slug);
        expect(actual.sort(bySlug)).toEqual(expected.sort(bySlug));
    }
    toString = () => `list(user${this.user})`;
}

class UpdateOrg implements OrgCommand {
    constructor(
        readonly user: number,
        readonly slug: string,
        readonly changes: { name?: string; slug?: string },
    ) {}
    check = () => true;
    async run(model: Model, real: Real) {
        const result = call(
            appRouter.organizations.update,
            { org: this.slug, ...this.changes },
            contextOf(real, this.user),
        );
        const org = memberOrg(model, this.user, this.slug);
        if (!org) {
            await rejectsWith(result, "NOT_FOUND");
            return;
        }
        const newSlug = this.changes.slug ?? this.slug;
        if (newSlug !== this.slug && model.orgs.has(newSlug)) {
            await rejectsWith(result, "CONFLICT");
            return;
        }
        const name = this.changes.name?.trim() ?? org.name;
        await expect(result).resolves.toMatchObject({ slug: newSlug, name });
        model.orgs.delete(this.slug);
        model.orgs.set(newSlug, { ...org, name });
    }
    toString = () =>
        `update(user${this.user}, ${this.slug}, ${JSON.stringify(this.changes)})`;
}

class DeleteOrg implements OrgCommand {
    constructor(
        readonly user: number,
        readonly slug: string,
    ) {}
    check = () => true;
    async run(model: Model, real: Real) {
        const result = call(
            appRouter.organizations.delete,
            { org: this.slug },
            contextOf(real, this.user),
        );
        if (!memberOrg(model, this.user, this.slug)) {
            await rejectsWith(result, "NOT_FOUND");
            return;
        }
        await expect(result).resolves.toMatchObject({ slug: this.slug });
        model.orgs.delete(this.slug);
    }
    toString = () => `delete(user${this.user}, ${this.slug})`;
}

const user = fc.integer({ min: 0, max: USERS - 1 });
const slug = fc.constantFrom(...SLUGS);
const name = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((value) => value.trim().length > 0);
const changes = fc
    .record({ name, slug }, { requiredKeys: [] })
    .filter((value) => value.name !== undefined || value.slug !== undefined);

const command = fc.oneof(
    {
        arbitrary: fc.tuple(user, slug).map(([u, s]) => new GetOrg(u, s)),
        weight: 4,
    },
    { arbitrary: user.map((u) => new ListOrgs(u)), weight: 3 },
    {
        arbitrary: fc
            .tuple(user, slug, name)
            .map(([u, s, n]) => new CreateOrg(u, s, n)),
        weight: 3,
    },
    {
        arbitrary: fc
            .tuple(user, slug, changes)
            .map(([u, s, c]) => new UpdateOrg(u, s, c)),
        weight: 2,
    },
    {
        arbitrary: fc.tuple(user, slug).map(([u, s]) => new DeleteOrg(u, s)),
        weight: 1,
    },
);

describe("organizations", () => {
    test("behave like a map of slugs to their members for any sequence of calls", {
        timeout: 120_000,
    }, async ({ db, signUp, contextFor }) => {
        const setup = async () => {
            await truncateAllTables(db);
            const contexts: Context[] = [];
            for (let index = 0; index < USERS; index++) {
                const { headers } = await signUp(`user${index}`);
                contexts.push(await contextFor(headers));
            }
            const model: Model = { orgs: new Map() };
            return { model, real: { contexts } };
        };

        await fc.assert(
            fc.asyncProperty(
                fc.commands([command], { maxCommands: 25, size: "medium" }),
                (commands) => fc.asyncModelRun(setup, commands),
            ),
            { numRuns: 50 },
        );
    });
});
