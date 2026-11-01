import { describe, expect, it } from "vitest";

import { imageProblem } from "./image";

const MB = 1024 * 1024;

function file(type: string, bytes = 10) {
    return new File([new Uint8Array(bytes)], "picture", { type });
}

describe("imageProblem", () => {
    it.each(["image/png", "image/jpeg", "image/webp"])("accepts %s", (type) => {
        expect(imageProblem(file(type))).toBeUndefined();
    });

    it.each(["image/gif", "image/svg+xml", "application/pdf", ""])(
        "rejects %j",
        (type) => {
            expect(imageProblem(file(type))).toBe(
                "Choose a PNG, JPEG or WebP image.",
            );
        },
    );

    it("accepts an image of exactly 5 MB", () => {
        expect(imageProblem(file("image/png", 5 * MB))).toBeUndefined();
    });

    it("rejects an image over 5 MB", () => {
        expect(imageProblem(file("image/png", 5 * MB + 1))).toBe(
            "Choose an image of 5 MB or less.",
        );
    });
});
