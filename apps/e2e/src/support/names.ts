import { randomBytes } from "node:crypto";

export function uniqueName(prefix: string) {
    return `${prefix}-${randomBytes(4).toString("hex")}`;
}
