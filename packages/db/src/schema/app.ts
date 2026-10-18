import { defineRelationsPart, sql } from "drizzle-orm";
import {
    type AnyPgColumn,
    check,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const appStatus = pgEnum("app_status", [
    "pending",
    "running",
    "sleeping",
    "destroying",
]);

export const deploymentKind = pgEnum("deployment_kind", [
    "deploy",
    "config",
    "secrets",
    "rollback",
]);

export const deploymentStatus = pgEnum("deployment_status", [
    "pending",
    "deploying",
    "ready",
    "failed",
    "superseded",
]);

export const app = pgTable(
    "app",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        ownerId: text("owner_id")
            .notNull()
            .references(() => user.id, { onDelete: "restrict" }),
        name: text("name").notNull().unique(),
        namespace: text("namespace").notNull(),
        hostname: text("hostname").notNull().unique(),
        status: appStatus("status").default("pending").notNull(),
        liveDeploymentId: text("live_deployment_id").references(
            (): AnyPgColumn => deployment.id,
            { onDelete: "set null" },
        ),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        deletedAt: timestamp("deleted_at"),
    },
    (table) => [
        index("app_ownerId_idx").on(table.ownerId),
        check(
            "app_name_dns_label",
            sql`char_length(${table.name}) <= 63 and ${table.name} ~ '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$'`,
        ),
    ],
);

export const appSecret = pgTable(
    "app_secret",
    {
        appId: text("app_id")
            .notNull()
            .references(() => app.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        value: text("value").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [primaryKey({ columns: [table.appId, table.name] })],
);

export const deployment = pgTable(
    "deployment",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        appId: text("app_id")
            .notNull()
            .references(() => app.id, { onDelete: "cascade" }),
        version: integer("version").notNull(),
        kind: deploymentKind("kind").notNull(),
        image: text("image").notNull(),
        imageDigest: text("image_digest"),
        port: integer("port").default(8080).notNull(),
        env: jsonb("env").$type<Record<string, string>>().default({}).notNull(),
        cpuMillis: integer("cpu_millis").notNull(),
        memoryMb: integer("memory_mb").notNull(),
        minScale: integer("min_scale").default(0).notNull(),
        maxScale: integer("max_scale").notNull(),
        concurrencyTarget: integer("concurrency_target"),
        zone: text("zone"),
        status: deploymentStatus("status").default("pending").notNull(),
        statusMessage: text("status_message"),
        createdById: text("created_by_id").references(() => user.id, {
            onDelete: "set null",
        }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [
        unique("deployment_appId_version_uq").on(table.appId, table.version),
        check(
            "deployment_scale_range",
            sql`${table.minScale} >= 0 and ${table.maxScale} > 0 and ${table.minScale} <= ${table.maxScale}`,
        ),
    ],
);

export type App = typeof app.$inferSelect;
export type AppStatus = (typeof appStatus.enumValues)[number];
export type Deployment = typeof deployment.$inferSelect;
export type DeploymentKind = (typeof deploymentKind.enumValues)[number];
export type DeploymentStatus = (typeof deploymentStatus.enumValues)[number];

export const appRelations = defineRelationsPart(
    { user, app, appSecret, deployment },
    (r) => ({
        app: {
            owner: r.one.user({
                from: r.app.ownerId,
                to: r.user.id,
            }),
            liveDeployment: r.one.deployment({
                from: r.app.liveDeploymentId,
                to: r.deployment.id,
            }),
            deployments: r.many.deployment({
                from: r.app.id,
                to: r.deployment.appId,
            }),
            secrets: r.many.appSecret({
                from: r.app.id,
                to: r.appSecret.appId,
            }),
        },
        appSecret: {
            app: r.one.app({
                from: r.appSecret.appId,
                to: r.app.id,
            }),
        },
        deployment: {
            app: r.one.app({
                from: r.deployment.appId,
                to: r.app.id,
            }),
            createdBy: r.one.user({
                from: r.deployment.createdById,
                to: r.user.id,
            }),
        },
    }),
);
