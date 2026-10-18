import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["src/**/*.integration.test.ts"],
        globalSetup: ["./src/integration/global-setup.ts"],
        fileParallelism: false,
    },
});
