import { describe, expect, it } from "vitest";

import { MAX_SLUG, slugify, slugProblem } from "./slug";

describe("slugify", () => {
    it.each([
        ["Acme", "acme"],
        ["Side projects", "side-projects"],
        ["  Café Société!  ", "cafe-societe"],
        ["R&D -- Team 2", "r-d-team-2"],
        ["---", ""],
    ])("turns %j into %j", (name, slug) => {
        expect(slugify(name)).toBe(slug);
    });

    it("stops at the maximum length without a trailing dash", () => {
        const slug = slugify(`${"a".repeat(MAX_SLUG - 1)} b`);

        expect(slug).toBe("a".repeat(MAX_SLUG - 1));
    });
});

describe("slugProblem", () => {
    it.each(["acme", "side-projects", "team-2", "a1"])("accepts %j", (slug) => {
        expect(slugProblem(slug)).toBeUndefined();
    });

    it.each([
        ["", "Enter a URL name"],
        ["a", "Use at least 2 characters"],
        ["a".repeat(MAX_SLUG + 1), `Use ${MAX_SLUG} characters or fewer`],
        [
            "Acme",
            "Use lowercase letters, numbers and single dashes between them",
        ],
        [
            "side--projects",
            "Use lowercase letters, numbers and single dashes between them",
        ],
        [
            "-acme",
            "Use lowercase letters, numbers and single dashes between them",
        ],
        ["new", "That URL name is reserved by quilt"],
        ["invitations", "That URL name is reserved by quilt"],
    ])("rejects %j", (slug, problem) => {
        expect(slugProblem(slug)).toBe(problem);
    });
});
