#!/usr/bin/env bash
# Install Knative Serving with Kourier as its networking layer.
#
# Versions come from cluster/versions.env. Set KNATIVE_DOMAIN to the domain apps get
# hostnames under, and KUBE_CONTEXT to target a context other than the current one.
set -euo pipefail

: "${KNATIVE_SERVING_VERSION:?set in cluster/versions.env}"
: "${KOURIER_VERSION:?set in cluster/versions.env}"
: "${KNATIVE_DOMAIN:?domain that app hostnames go under}"

k() { kubectl ${KUBE_CONTEXT:+--context "$KUBE_CONTEXT"} "$@"; }

serving="https://github.com/knative/serving/releases/download/knative-v${KNATIVE_SERVING_VERSION}"
kourier="https://github.com/knative-extensions/net-kourier/releases/download/knative-v${KOURIER_VERSION}"

k apply -f "$serving/serving-crds.yaml"
k wait crd -l knative.dev/crd-install=true --for=condition=Established --timeout=60s
k apply -f "$serving/serving-core.yaml"
k apply -f "$kourier/kourier.yaml"

k wait deployment --all --for=condition=Available --timeout=300s -n knative-serving
k wait deployment --all --for=condition=Available --timeout=300s -n kourier-system

# Config changes go through Knative's webhook, so they wait until it is up.
k patch configmap config-network -n knative-serving --type merge \
    -p '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'
k patch configmap config-domain -n knative-serving --type merge \
    -p "{\"data\":{\"${KNATIVE_DOMAIN}\":\"\"}}"
