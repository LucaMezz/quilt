import { z } from "zod";
import { MAX_IMAGE_BYTES } from "#/lib/images";
import { describeErrorResponse } from "#/openapi";

export const ImageFile = z
    .file()
    .max(MAX_IMAGE_BYTES)
    .describe("PNG, JPEG or WebP image");

export const invalidImage = describeErrorResponse(
    { message: "Not a valid PNG, JPEG or WebP image" },
    400,
    "The image isn't a PNG, JPEG or WebP image, or couldn't be decoded",
);

export function describeImageUpload(maxDimension: number) {
    return `Send a PNG, JPEG or WebP image of up to ${MAX_IMAGE_BYTES / 1024 / 1024} MB as \`multipart/form-data\`; it's stored as WebP, scaled down to fit ${maxDimension}×${maxDimension} pixels.`;
}
