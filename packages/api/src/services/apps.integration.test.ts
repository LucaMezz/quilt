import { describe, expect } from "vitest";

import { test } from "../testing/fixtures";
import { createApp, listApps } from "./apps";

describe("apps service", () => {
    test("lists an app after creating it", async ({
        db,
        createOrganization,
    }) => {
        const { organization } = await createOrganization();

        const created = await createApp(
            db,
            { organizationId: organization.id, name: "hello" },
            "apps.test",
        );
        const page = await listApps(db, organization.id, { limit: 10 });

        expect(created).toMatchObject({
            name: "hello",
            hostname: "hello.apps.test",
            namespace: `app-${created.id}`,
            status: "pending",
        });
        expect(page).toEqual({ items: [created], nextCursor: null });
    });
});
