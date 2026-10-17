export type E2EEnvironment = {
    runId: string;
    baseUrl: string;
    databaseUrl: string;
    kubeContext: string;
    namespace: string;
    image: string;
    reconcileIntervalMs: number;
};

declare module "vitest" {
    export interface ProvidedContext {
        e2e: E2EEnvironment;
    }
}
