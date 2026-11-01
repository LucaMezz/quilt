import { FieldGroup } from "@quilt/ui/components/field";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { PageHeader } from "@/components/app/page-header";
import { Detail, DetailList } from "@/components/display/detail-list";
import { RelativeTime } from "@/components/display/relative-time";
import { useAppForm } from "@/components/form/use-app-form";
import { SectionCard } from "@/components/settings/section-card";
import { UpdateBar } from "@/components/settings/update-bar";
import { MAX_NAME, slugProblem } from "@/lib/organizations/slug";
import {
  canManageOrganization,
  type Organization,
  useOrganization,
  useOrganizations,
  useUpdateOrganization,
} from "@/lib/organizations/use-organizations";

export const Route = createFileRoute("/_auth/organizations/$org/settings")({
  component: OrganizationSettings,
  staticData: { breadcrumb: "Settings" },
});

const ROLES = { owner: "Owner", admin: "Admin", member: "Member" };

function OrganizationSettings() {
  const { org } = Route.useParams();
  const organization = useOrganization(org);
  if (!organization) return null;

  return (
    <>
      <PageHeader
        title="Settings"
        description="How this organization is named and found."
      />
      <div className="flex max-w-3xl flex-col gap-6">
        <General key={organization.id} organization={organization} />
        <SectionCard title="Details">
          <DetailList>
            <Detail label="ID">
              <code className="break-all">{organization.id}</code>
            </Detail>
            <Detail label="Your role">{ROLES[organization.role]}</Detail>
            <Detail label="Created">
              <RelativeTime date={organization.createdAt} fallback="Unknown" />
            </Detail>
          </DetailList>
        </SectionCard>
      </div>
    </>
  );
}

function General({ organization }: { organization: Organization }) {
  const organizations = useOrganizations();
  const update = useUpdateOrganization();
  const navigate = Route.useNavigate();
  const canManage = canManageOrganization(organization);
  const takenSlugs = organizations
    .filter((other) => other.id !== organization.id)
    .map((other) => other.slug);

  const form = useAppForm({
    defaultValues: { name: organization.name, slug: organization.slug },
    validators: {
      onSubmit: z.object({
        name: z
          .string()
          .trim()
          .min(1, "Enter a name")
          .max(MAX_NAME, `Use ${MAX_NAME} characters or fewer`),
        slug: z.string().superRefine((slug, context) => {
          const problem = takenSlugs.includes(slug)
            ? "That URL name is already taken"
            : slugProblem(slug);
          if (problem) context.addIssue({ code: "custom", message: problem });
        }),
      }),
    },
    onSubmit: ({ value }) => {
      const changes = { name: value.name.trim(), slug: value.slug };
      update(organization.id, changes);
      form.reset(changes);
      toast.success(`Updated ${changes.name}`);
      if (changes.slug !== organization.slug) {
        navigate({
          to: "/organizations/$org/settings",
          params: { org: changes.slug },
          replace: true,
        });
      }
    },
  });

  return (
    <SectionCard
      title="General"
      description={
        canManage ? undefined : "Only owners and admins can change these."
      }
    >
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                autoComplete="organization"
                disabled={!canManage}
                description="Shown to members and on invitations."
                className="max-w-sm"
              />
            )}
          </form.AppField>
          <form.AppField name="slug">
            {(field) => (
              <field.TextField
                label="URL name"
                autoComplete="off"
                spellCheck={false}
                disabled={!canManage}
                className="max-w-sm"
                description={
                  <>
                    Used in links like{" "}
                    <code>/organizations/{field.state.value || "acme"}</code>.
                    Changing it breaks links that use the old one.
                  </>
                }
              />
            )}
          </form.AppField>
        </FieldGroup>
        {canManage && (
          <form.Subscribe
            selector={(state) =>
              state.values.name.trim() !== organization.name ||
              state.values.slug !== organization.slug
            }
          >
            {(changed) => (
              <UpdateBar
                changed={changed}
                label="Update organization"
                onDiscard={() => form.reset()}
                onUpdate={() => form.handleSubmit()}
              />
            )}
          </form.Subscribe>
        )}
      </form>
    </SectionCard>
  );
}
