import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        QUILT_API_URL: z
            .url()
            .default("http://localhost:3000")
            .transform((url) => url.replace(/\/$/, "")),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
