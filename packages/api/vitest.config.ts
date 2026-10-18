import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
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
