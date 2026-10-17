import {
    ApiException,
    AppsV1Api,
    CoreV1Api,
    KubeConfig,
} from "@kubernetes/client-node";

const DISPOSABLE_CONTEXT = /^(k3d|kind)-/;
const RUN_LABEL = "quilt.dev/e2e-run";

export type KubeClients = {
    core: CoreV1Api;
    apps: AppsV1Api;
};

export function assertDisposableContext(context: string) {
    if (!DISPOSABLE_CONTEXT.test(context)) {
        throw new Error(
            `Refusing to run e2e tests against Kubernetes context "${context}"; only k3d-* and kind-* contexts are allowed`,
        );
    }
}

export function createKubeClients(context: string): KubeClients {
    assertDisposableContext(context);
    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromDefault();
    if (!kubeConfig.getContextObject(context)) {
        throw new Error(
            `Kubernetes context "${context}" not found in kubeconfig`,
        );
    }
    kubeConfig.setCurrentContext(context);
    return {
        core: kubeConfig.makeApiClient(CoreV1Api),
        apps: kubeConfig.makeApiClient(AppsV1Api),
    };
}

function isNotFound(error: unknown) {
    return error instanceof ApiException && error.code === 404;
}

export async function createNamespace(
    kube: KubeClients,
    name: string,
    runId: string,
) {
    await kube.core.createNamespace({
        body: { metadata: { name, labels: { [RUN_LABEL]: runId } } },
    });
}

export async function deleteRunNamespaces(kube: KubeClients, runId: string) {
    const namespaces = await kube.core.listNamespace({
        labelSelector: `${RUN_LABEL}=${runId}`,
    });
    await Promise.all(
        namespaces.items.map(async ({ metadata }) => {
            if (!metadata?.name) return;
            try {
                await kube.core.deleteNamespace({ name: metadata.name });
            } catch (error) {
                if (!isNotFound(error)) throw error;
            }
        }),
    );
}
