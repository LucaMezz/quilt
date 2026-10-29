import type { Auth } from "@quilt/auth";
import type { Database } from "@quilt/db";
import { organization } from "@quilt/db/schema/auth";
import { eq } from "drizzle-orm";

export async function createOrganizationAs(
    auth: Auth,
    db: Database,
    headers: Headers,
    slug = "acme",
    name = "Acme",
) {
    await auth.api.createOrganization({ body: { name, slug }, headers });
    const [created] = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, slug));
    if (!created) throw new Error("Organization was not created");
    return created;
}
