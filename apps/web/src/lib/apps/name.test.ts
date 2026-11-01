import { describe, expect, it } from "vitest";

import { appNameProblem, MAX_APP_NAME } from "./name";

const pattern =
    "Use lowercase letters, numbers and dashes, starting and ending with a letter or number";

describe("appNameProblem", () => {
    it.each([
        "api",
        "a",
        "billing-worker",
        "v2--beta",
        "a".repeat(MAX_APP_NAME),
    ])("accepts %j", (name) => {
        expect(appNameProblem(name)).toBeUndefined();
    });

    it.each([
        ["", "Enter a name"],
        [
            "a".repeat(MAX_APP_NAME + 1),
            `Use ${MAX_APP_NAME} characters or fewer`,
        ],
        ["Api", pattern],
        ["-api", pattern],
        ["api-", pattern],
        ["my_app", pattern],
        ["new", "That name is reserved by quilt"],
    ])("rejects %j", (name, problem) => {
        expect(appNameProblem(name)).toBe(problem);
    });
});
