import { stripVTControlCharacters } from "node:util";
import { vi } from "vitest";

function joined(spy: (...args: never[]) => unknown) {
    return stripVTControlCharacters(
        vi
            .mocked(spy)
            .mock.calls.map((args) => (args as unknown[]).join(" "))
            .join("\n"),
    );
}

export function captureOutput() {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process.stderr, "write").mockReturnValue(true);
}

export function stdout() {
    return joined(console.log);
}

export function stderr() {
    return joined(console.error);
}
