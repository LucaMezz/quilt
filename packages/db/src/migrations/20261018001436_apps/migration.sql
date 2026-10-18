CREATE TYPE "app_status" AS ENUM('pending', 'running', 'sleeping', 'destroying');--> statement-breakpoint
CREATE TYPE "deployment_kind" AS ENUM('deploy', 'config', 'secrets', 'rollback');--> statement-breakpoint
CREATE TYPE "deployment_status" AS ENUM('pending', 'deploying', 'ready', 'failed', 'superseded');--> statement-breakpoint
CREATE TABLE "app" (
	"id" text PRIMARY KEY,
	"owner_id" text NOT NULL,
	"name" text NOT NULL UNIQUE,
	"namespace" text NOT NULL,
	"hostname" text NOT NULL UNIQUE,
	"status" "app_status" DEFAULT 'pending'::"app_status" NOT NULL,
	"live_deployment_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "app_name_dns_label" CHECK (char_length("name") <= 63 and "name" ~ '^[a-z0-9]([-a-z0-9]*[a-z0-9])?$')
);
--> statement-breakpoint
CREATE TABLE "app_secret" (
	"app_id" text,
	"name" text,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "app_secret_pkey" PRIMARY KEY("app_id","name")
);
--> statement-breakpoint
CREATE TABLE "deployment" (
	"id" text PRIMARY KEY,
	"app_id" text NOT NULL,
	"version" integer NOT NULL,
	"kind" "deployment_kind" NOT NULL,
	"image" text NOT NULL,
	"image_digest" text,
	"port" integer DEFAULT 8080 NOT NULL,
	"env" jsonb DEFAULT '{}' NOT NULL,
	"cpu_millis" integer NOT NULL,
	"memory_mb" integer NOT NULL,
	"min_scale" integer DEFAULT 0 NOT NULL,
	"max_scale" integer NOT NULL,
	"concurrency_target" integer,
	"zone" text,
	"status" "deployment_status" DEFAULT 'pending'::"deployment_status" NOT NULL,
	"status_message" text,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deployment_appId_version_uq" UNIQUE("app_id","version"),
	CONSTRAINT "deployment_scale_range" CHECK ("min_scale" >= 0 and "max_scale" > 0 and "min_scale" <= "max_scale")
);
--> statement-breakpoint
CREATE INDEX "app_ownerId_idx" ON "app" ("owner_id");--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_owner_id_user_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_live_deployment_id_deployment_id_fkey" FOREIGN KEY ("live_deployment_id") REFERENCES "deployment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "app_secret" ADD CONSTRAINT "app_secret_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deployment" ADD CONSTRAINT "deployment_app_id_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "deployment" ADD CONSTRAINT "deployment_created_by_id_user_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL;