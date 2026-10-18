import type { StorageConfig } from "../config";

declare module "vitest" {
    export interface ProvidedContext {
        storageConfig: StorageConfig;
    }
}
