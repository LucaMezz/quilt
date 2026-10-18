import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts", "src/testing/**", "src/env.ts"],
            reporter: ["text-summary", "lcov"],
            reportsDirectory: "coverage/unit",
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    include: ["src/**/*.test.ts"],
                    exclude: [
                        ...configDefaults.exclude,
                        "src/**/*.integration.test.ts",
                    ],
                },
            },
            {
                extends: true,
                test: {
                    name: "integration",
                    include: ["src/**/*.integration.test.ts"],
                    globalSetup: ["./src/testing/global-setup.ts"],
                    fileParallelism: false,
                },
            },
        ],
    },
});
