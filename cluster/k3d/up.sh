#!/usr/bin/env bash
set -euo pipefail

: "${PROJECT_NAME:?set in cluster/project.env}"
: "${CLUSTER_ENV:?set in the environment cluster.env}"

k3d cluster create --config cluster/k3d/cluster.yaml
KUBE_CONTEXT="k3d-${PROJECT_NAME}-${CLUSTER_ENV}" cluster/platform/install.sh
