import { deleteObject, putObject, type Storage } from "@quilt/storage";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 4096 * 4096;

export class InvalidImageError extends Error {
    constructor(reason: string, options?: ErrorOptions) {
        super(reason, options);
        this.name = "InvalidImageError";
    }
}

sharp.block({ operation: ["VipsForeignLoad"] });
sharp.unblock({
    operation: [
        "VipsForeignLoadPngBuffer",
        "VipsForeignLoadJpegBuffer",
        "VipsForeignLoadWebpBuffer",
    ],
});

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

export type ImageSlot = {
    prefix: string;
    maxDimension: number;
    currentKey: string | null | undefined;
};

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
    const key = `${slot.prefix}${crypto.randomUUID()}.webp`;
    await putObject(storage, key, encoded, "image/webp");

    let saved: T;
    try {
        saved = await save(key);
    } catch (error) {
        await deleteObject(storage, key);
        throw error;
    }

    if (slot.currentKey?.startsWith(slot.prefix)) {
        await deleteObject(storage, slot.currentKey).catch(() => {});
    }
    return saved;
}
