/**
 * @module
 *
 * This module provides a standard pipeline for processing every
 * user-uploaded image:
 *  - Validation
 *  - Re-encoding
 *  - Storage
 *  - Replacement
 *
 * Re-encoding is done so that untrusted bytes are not blindly
 * stored. It normalises every image to a single format (WebP)
 * and strips out any metadata that could be used to track users.
 *
 * The accepted formats are PNG, JPEG and WebP.
 */

import { deleteObject, putObject, type Storage } from "@quilt/storage";
import sharp from "sharp";

/** The maximum size that an image to be stored can be */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 4096 * 4096;

/** Indicates that an image provided by the client is invalid. */
export class InvalidImageError extends Error {
    /**
     * @param reason - Message shown to the client explaining what was wrong.
     * @param options - Standard error options; pass `cause` with the original
     *   decoder error so it stays available in logs.
     */
    constructor(reason: string, options?: ErrorOptions) {
        super(reason, options);
        this.name = "InvalidImageError";
    }
}

// Block the decoding of every image format.
sharp.block({ operation: ["VipsForeignLoad"] });

// Unblock the decoding of PNG, JPEG and WebP.
// These are the only supported formats for now.
sharp.unblock({
    operation: [
        "VipsForeignLoadPngBuffer",
        "VipsForeignLoadJpegBuffer",
        "VipsForeignLoadWebpBuffer",
    ],
});

/**
 * Encodes an uploaded image to WebP, scaling any larger than the max
 * dimension down to fit, and leaving smaller ones at their size.
 *
 * @param image - The uploaded file, as received from the request.
 * @param maxDimension - Longest side allowed, in pixels; larger images are
 *   scaled down to fit, smaller ones are left at their size.
 * @returns The re-encoded image as WebP bytes.
 * @throws {InvalidImageError} If the image isn't a decodable PNG, JPEG or WebP,
 *   or has more than 4096 × 4096 pixels.
 */
export async function encodeImage(
    image: Blob,
    maxDimension: number,
): Promise<Uint8Array> {
    const input = new Uint8Array(await image.arrayBuffer());
    try {
        return await sharp(input, { limitInputPixels: MAX_IMAGE_PIXELS })
            .rotate()
            .resize(maxDimension, maxDimension, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp()
            .toBuffer();
    } catch (error) {
        throw new InvalidImageError(
            "Image must be a PNG, JPEG or WebP image that can be decoded",
            { cause: error },
        );
    }
}

/** Describes one location where an image is stored. */
export type ImageSlot = {
    /** Object key prefix for this slot, ending in `/`, e.g. `apps/<id>/logo/`. */
    prefix: string;
    /** Longest side allowed, in pixels, passed to `encodeImage`. */
    maxDimension: number;
    /** Key of the image stored now, or `null`/`undefined` if there is none. */
    currentKey: string | null | undefined;
};

/**
 * Replaces the image in a slot with a new one, deleting the old one if
 * it exists. The new image is encoded to WebP and scaled down if larger
 * than the max size. The new object key is passed to `save`, which
 * usually stores it in a database column and returns the updated record.
 *
 * @typeParam T - What `save` returns, e.g. the updated database row.
 * @param storage - The object storage to write to.
 * @param slot - Where the image goes and which image it replaces.
 * @param image - The uploaded file, as received from the request.
 * @param save - Stores the new object key, usually in a database column, and
 *   returns the updated record.
 * @returns Whatever `save` returned.
 * @throws {Error} If `slot.prefix` doesn't end in `/`.
 * @throws {InvalidImageError} If the image can't be decoded (see
 *   `encodeImage`).
 * @throws Any error from the storage upload.
 * @throws Any error from `save`, after the newly uploaded object is deleted.
 */
export async function replaceImage<T>(
    storage: Storage,
    slot: ImageSlot,
    image: Blob,
    save: (key: string) => Promise<T>,
): Promise<T> {
    if (!slot.prefix.endsWith("/")) {
        throw new Error(`Image prefix "${slot.prefix}" must end with "/"`);
    }
    const encoded = await encodeImage(image, slot.maxDimension);

    // A random UUID is used as the file name instead of some fixed name like
    // "logo.webp" to avoid caching issues when the image is updated. The browser
    // would otherwise keep showing the old image until the cache expires,
    // which can be a long time.
    //
    // Additionally, suppose the image is updated in storage but saving to the
    // database fails. If the new image had a fixed name, it would overwrite
    // the old image and the app would be left with a broken logo.
    //
    // Using a random name allows you to upload the new image leaving the old
    // one untouched. Then if saving the new key to the database fails, the new
    // object is just deleted and the old one remains, so nothing changes.
    const key = `${slot.prefix}${crypto.randomUUID()}.webp`;
    await putObject(storage, key, encoded, "image/webp");

    let saved: T;
    try {
        saved = await save(key);
    } catch (error) {
        await deleteObject(storage, key);
        throw error;
    }

    // Deleting the old image can fail, and we don't want to block the request
    // because of that. So, we simply ignore it. The downside to this is that
    // it causes orphaned objects to accumulate in storage. That can be cleaned
    // up pretty easily with a regular cleaning job to discover and delete
    // orpaned objects.
    if (slot.currentKey?.startsWith(slot.prefix)) {
        await deleteObject(storage, slot.currentKey).catch(() => {});
    }
    return saved;
}
