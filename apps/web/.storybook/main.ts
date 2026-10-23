import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

function getAbsolutePath(value: string) {
    return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
    stories: [
        "../src/**/*.mdx",
        "../src/**/*.stories.@(ts|tsx)",
        "../../../packages/ui/src/**/*.stories.@(ts|tsx)",
    ],
    addons: [getAbsolutePath("@storybook/addon-docs")],
    framework: {
        name: getAbsolutePath("@storybook/react-vite"),
        options: {
            builder: { viteConfigPath: ".storybook/vite.config.ts" },
        },
    },
};

export default config;
