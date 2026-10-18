import type { StorageConfig } from "@quilt/storage/config";

declare module "vitest" {
    export interface ProvidedContext {
        databaseUrl: string;
        storageConfig: StorageConfig;
    }
}
