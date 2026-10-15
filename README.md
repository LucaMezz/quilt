<div align="center">

<h1>quilt</h1>

<p><strong>A self-hosted PaaS that stitches your servers together and lets idle apps sleep.</strong></p>

<p>
  <img alt="Status: alpha" src="https://img.shields.io/badge/status-alpha-orange">
  <img alt="Not for production" src="https://img.shields.io/badge/production-not%20ready-red">
  <img alt="License: TBD" src="https://img.shields.io/badge/license-TBD-lightgrey">
  <br>
  <img alt="Rust" src="https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
  <img alt="k3s" src="https://img.shields.io/badge/k3s-FFC61C?logo=k3s&logoColor=black">
  <img alt="Knative" src="https://img.shields.io/badge/Knative-0865AD?logo=knative&logoColor=white">
</p>

</div>

---

quilt turns a pool of servers you already own into one platform. Push an app and quilt
picks the server, gives the app a fixed hostname, and puts it to sleep when nobody is
using it. It wakes up again on the next request.

## Goals

- **Scale to zero.** Idle apps use no memory or CPU and wake on the first request.
- **Bring your own servers.** Any Linux machine joins the pool with one command.
- **No server picking.** Placement is automatic; you can pin apps to a zone if you need to.
- **Stable hostnames.** An app keeps its URL when it moves between servers.
- **API first.** The web app and the CLI use the same public API.
- **Billing.** Run it for yourself, or meter usage and bill customers.

## Status

Early development. Nothing here is usable yet.

## Planned structure

The repo will grow into roughly this shape as each part gets built:

```
quilt/
├── apps/
│   ├── web/        dashboard
│   ├── server/     public API
│   └── desktop/    desktop app
├── packages/       shared TypeScript (api contract, db schema, auth, ui)
├── crates/
│   ├── cli/        quilt CLI
│   ├── operator/   turns apps into cluster workloads
│   └── agent/      runs on each server: joining and idle tracking
├── deploy/         install and join scripts
└── docs/
```

## License

Not decided yet.
