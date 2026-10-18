import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts so tests don't load the varlock or router
// plugins, which need a real environment and generate files.
export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        coverage: {
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/**/*.test.{ts,tsx}",
                "src/test/**",
                "src/env.ts",
                "src/routeTree.gen.ts",
            ],
            reporter: ["text-summary", "lcov"],
            reportsDirectory: "coverage/unit",
        },
    },
});
