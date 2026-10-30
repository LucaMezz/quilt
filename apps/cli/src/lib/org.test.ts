import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { captureOutput, stderr } from "../testing/output";
import { selectedOrg } from "./org";

beforeEach(() => {
    captureOutput();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

describe("selectedOrg", () => {
    it("uses the --org flag", () => {
        vi.stubEnv("QUILT_ORG", "from-env");

        expect(selectedOrg("from-flag")).toBe("from-flag");
    });

    it("falls back to QUILT_ORG", () => {
        vi.stubEnv("QUILT_ORG", "from-env");

        expect(selectedOrg(undefined)).toBe("from-env");
    });

    it("explains how to pick one when neither is set", () => {
        vi.stubEnv("QUILT_ORG", "");

        expect(selectedOrg(undefined)).toBeUndefined();
        expect(stderr()).toContain("--org");
        expect(stderr()).toContain("QUILT_ORG");
    });
});
