import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Kept separate from vite.config.ts so Storybook doesn't load the varlock or
// router plugins, which need a real environment and generate files.
export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [tailwindcss(), react()],
});
