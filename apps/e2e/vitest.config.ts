import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/tests/**/*.e2e.test.ts"],
        globalSetup: ["./src/harness/global-setup.ts"],
        fileParallelism: false,
        testTimeout: 120_000,
        hookTimeout: 120_000,
        teardownTimeout: 120_000,
    },
});
