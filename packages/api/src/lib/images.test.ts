import sharp, { type Sharp } from "sharp";
import { describe, expect, it } from "vitest";

import { encodeImage, InvalidImageError } from "./images";

const MAX_DIMENSION = 512;

function encode(image: Blob) {
    return encodeImage(image, MAX_DIMENSION);
}

function solidImage(width: number, height: number) {
    return sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 200, g: 40, b: 90 },
        },
    });
}

function asFile(bytes: Uint8Array | string, name: string, type: string) {
    const part = typeof bytes === "string" ? bytes : new Uint8Array(bytes);
    return new File([part], name, { type });
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><script>alert(1)</script><rect width="64" height="64" fill="red"/></svg>`;

describe("encodeImage", () => {
    it.each([
        ["png", (image: Sharp) => image.png()],
        ["jpeg", (image: Sharp) => image.jpeg()],
        ["webp", (image: Sharp) => image.webp()],
    ])("re-encodes a %s image as WebP", async (format, toFormat) => {
        const input = await toFormat(solidImage(64, 64)).toBuffer();

        const output = await encode(
            asFile(input, `image.${format}`, `image/${format}`),
        );

        const metadata = await sharp(output).metadata();
        expect(metadata).toMatchObject({
            format: "webp",
            width: 64,
            height: 64,
        });
    });

    it("scales large images down to fit while keeping the aspect ratio", async () => {
        const input = await solidImage(2000, 1000).png().toBuffer();

        const output = await encode(asFile(input, "image.png", "image/png"));

        const metadata = await sharp(output).metadata();
        expect(metadata.width).toBe(MAX_DIMENSION);
        expect(metadata.height).toBe(MAX_DIMENSION / 2);
    });

    it("strips metadata such as EXIF", async () => {
        const input = await solidImage(64, 64)
            .withExif({ IFD0: { Copyright: "secret" } })
            .jpeg()
            .toBuffer();
        expect((await sharp(input).metadata()).exif).toBeDefined();

        const output = await encode(asFile(input, "image.jpg", "image/jpeg"));

        expect((await sharp(output).metadata()).exif).toBeUndefined();
    });

    it.each([
        ["an SVG", asFile(svg, "image.svg", "image/svg+xml")],
        ["an SVG claiming to be a PNG", asFile(svg, "image.png", "image/png")],
        ["plain text", asFile("hello", "image.png", "image/png")],
        ["an empty file", asFile("", "image.png", "image/png")],
    ])("rejects %s", async (_, file) => {
        await expect(encode(file)).rejects.toBeInstanceOf(InvalidImageError);
    });

    it("rejects a GIF", async () => {
        const input = await solidImage(16, 16).gif().toBuffer();

        await expect(
            encode(asFile(input, "image.gif", "image/gif")),
        ).rejects.toBeInstanceOf(InvalidImageError);
    });

    it("rejects a truncated image", async () => {
        const input = await solidImage(256, 256).png().toBuffer();

        await expect(
            encode(asFile(input.subarray(0, 64), "image.png", "image/png")),
        ).rejects.toBeInstanceOf(InvalidImageError);
    });

    it("rejects images with too many pixels", async () => {
        const input = await solidImage(5000, 5000).png().toBuffer();

        await expect(
            encode(asFile(input, "image.png", "image/png")),
        ).rejects.toBeInstanceOf(InvalidImageError);
    });
});
