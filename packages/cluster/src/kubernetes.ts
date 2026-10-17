import { KubeConfig } from "@kubernetes/client-node";

import type { Cluster } from "./cluster";
import type { ClusterConfig } from "./config";

function loadKubeConfig(config: ClusterConfig) {
    const kubeConfig = new KubeConfig();
    if (config.KUBECONFIG) {
        kubeConfig.loadFromFile(config.KUBECONFIG);
    } else {
        kubeConfig.loadFromDefault();
    }
    if (config.KUBE_CONTEXT) {
        if (!kubeConfig.getContextObject(config.KUBE_CONTEXT)) {
            throw new Error(
                `Kubernetes context "${config.KUBE_CONTEXT}" not found in kubeconfig`,
            );
        }
        kubeConfig.setCurrentContext(config.KUBE_CONTEXT);
    }
    return kubeConfig;
}

export function createKubernetesCluster(config: ClusterConfig = {}): Cluster {
    loadKubeConfig(config);

    return {};
}
