import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";

import "../src/index.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => {
      const dark = globals.theme === "dark";
      useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        document.documentElement.style.colorScheme = dark ? "dark" : "light";
      }, [dark]);
      return <Story />;
    },
  ],
  parameters: {
    a11y: { test: "error" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
