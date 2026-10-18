ALTER TABLE "app" DROP CONSTRAINT "app_owner_id_user_id_fkey";--> statement-breakpoint
DROP INDEX "app_ownerId_idx";--> statement-breakpoint
ALTER TABLE "app" ADD COLUMN "organization_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "app" DROP COLUMN "owner_id";--> statement-breakpoint
CREATE INDEX "app_organizationId_idx" ON "app" ("organization_id");--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT;