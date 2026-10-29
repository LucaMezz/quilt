import { ValidationError } from "@orpc/server";
import { expect } from "vitest";

export function declaredError(code: string, status: number) {
    return { code, status, defined: true };
}

export function invalidInput() {
    return { code: "BAD_REQUEST", cause: expect.any(ValidationError) };
}
