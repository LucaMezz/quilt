---
title: "0001: Resource model"
description: The resources the public API exposes in the prototype.
---

# 0001: Resource model

**Status:** Draft

The prototype API exposes five resources. Everything is scoped to a workspace, even
in personal mode, so business mode can be added later without a migration.

```
Workspace ──< App ──< Deployment
  │       │
  │       └── placed on ──> Node >── Zone
  └──< Zone
```

## Workspace

The owner of everything else. Personal mode has exactly one.

| Field | Notes |
| --- | --- |
| `id` | |
| `name` | |

## Zone

A label that groups nodes, such as `eu` or `cheap`. Apps can be pinned to one.

| Field | Notes |
| --- | --- |
| `id` | |
| `workspace_id` | |
| `name` | Unique within the workspace |

## Node

A server in the pool.

| Field | Notes |
| --- | --- |
| `id` | |
| `workspace_id` | |
| `name` | |
| `zone_id` | Set by the join command |
| `status` | `joining`, `ready`, `not_ready` |

## App

Something the user deployed. Users never choose its node.

| Field | Notes |
| --- | --- |
| `id` | |
| `workspace_id` | |
| `name` | Unique within the workspace; used in the hostname |
| `hostname` | Assigned automatically; never changes |
| `zone_id` | Optional pin; null means any zone |
| `state` | `deploying`, `running`, `sleeping`, `waking`, `failed` |
| `node_id` | Where it runs now; null while sleeping |
| `placement_reason` | Why it is on that node, for the dashboard |

## Deployment

One version of an app. Each deploy creates a new one; the latest successful one
is live.

| Field | Notes |
| --- | --- |
| `id` | |
| `app_id` | |
| `image` | Container image reference |
| `port` | Port the app listens on |
| `env` | Environment variables |
| `status` | `pending`, `live`, `failed`, `superseded` |
| `created_at` | |

## Open questions

- Is `state` on App reliable once Knative or KEDA is in place? Revisit after
  Gate 1.
- Do sleep settings (idle timeout, opt-out) belong on App or Deployment?
- Zone labels: free text or a fixed list? (From the brief.)
