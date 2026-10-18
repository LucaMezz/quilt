import type { Auth } from "@quilt/auth";
import type { Database } from "@quilt/db";
import { user } from "@quilt/db/schema/auth";
import type { Storage } from "@quilt/storage";
import { eq } from "drizzle-orm";

import { replaceImage } from "./images";

export type User = typeof user.$inferSelect;

export const USER_IMAGE_DIMENSION = 512;

export function userImagePrefix(userId: string) {
    return `users/${userId}/image/`;
}

export async function getUser(db: Database, userId: string): Promise<User> {
    const [found] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
    if (!found) throw new Error(`User "${userId}" not found`);
    return found;
}

export async function setUserImage(
    db: Database,
    auth: Auth,
    storage: Storage,
    headers: Headers,
    userId: string,
    image: Blob,
) {
    const current = await getUser(db, userId);
    const slot = {
        prefix: userImagePrefix(current.id),
        maxDimension: USER_IMAGE_DIMENSION,
        currentKey: current.image,
    };
    return replaceImage(storage, slot, image, async (key) => {
        await auth.api.updateUser({ body: { image: key }, headers });
        return getUser(db, userId);
    });
}
