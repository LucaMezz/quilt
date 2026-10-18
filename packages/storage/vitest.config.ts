import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.integration.test.ts"],
        globalSetup: ["./src/integration/global-setup.ts"],
        fileParallelism: false,
        coverage: {
            include: ["src/**/*.ts"],
            exclude: [
                "src/**/*.test.ts",
                "src/integration/**",
                "src/testing.ts",
                "src/env.ts",
            ],
            reporter: ["text-summary", "lcov"],
            reportsDirectory: "coverage/integration",
        },
    },
});
