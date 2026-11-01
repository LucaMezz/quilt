import { buttonVariants } from "@quilt/ui/components/button";
import { FieldGroup } from "@quilt/ui/components/field";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { PageHeader } from "@/components/app/page-header";
import { useAppForm } from "@/components/form/use-app-form";
import { BackLink } from "@/components/settings/back-link";
import { SectionCard } from "@/components/settings/section-card";
import { MAX_NAME, slugify, slugProblem } from "@/lib/organizations/slug";
import {
  useCreateOrganization,
  useOrganizations,
} from "@/lib/organizations/use-organizations";

export const Route = createFileRoute("/_auth/_user/organizations/new")({
  component: NewOrganizationPage,
  staticData: { breadcrumb: "New organization" },
});

function schemaFor(takenSlugs: string[]) {
  return z.object({
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
  });
}

function NewOrganizationPage() {
  const organizations = useOrganizations();
  const create = useCreateOrganization();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: { name: "", slug: "" },
    validators: {
      onSubmit: schemaFor(
        organizations.map((organization) => organization.slug),
      ),
    },
    onSubmit: ({ value }) => {
      const organization = create({
        name: value.name.trim(),
        slug: value.slug,
      });
      toast.success(`Created ${organization.name}`);
      navigate({ to: "/organizations" });
    },
  });

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <BackLink to="/organizations">All organizations</BackLink>
        <PageHeader
          title="New organization"
          description="An organization holds apps, servers and the people who manage them. You'll be its owner."
        />
      </div>
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <SectionCard title="Details">
          <FieldGroup>
            <form.AppField
              name="name"
              listeners={{
                onChange: ({ value }) => {
                  if (form.getFieldMeta("slug")?.isDirty) return;
                  form.setFieldValue("slug", slugify(value), {
                    dontUpdateMeta: true,
                  });
                },
              }}
            >
              {(field) => (
                <field.TextField
                  label="Name"
                  placeholder="e.g. Acme"
                  autoComplete="organization"
                  description="Shown to members and on invitations. You can change it later."
                />
              )}
            </form.AppField>
            <form.AppField name="slug">
              {(field) => (
                <field.TextField
                  label="URL name"
                  autoComplete="off"
                  spellCheck={false}
                  description={
                    <>
                      Used in links to the organization, like{" "}
                      <code>/organizations/{field.state.value || "acme"}</code>.
                      Lowercase letters, numbers and dashes.
                    </>
                  }
                />
              )}
            </form.AppField>
          </FieldGroup>
        </SectionCard>
        <div className="flex justify-end gap-2">
          <Link
            to="/organizations"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
          <form.AppForm>
            <form.SubmitButton pending="Creating organization...">
              Create organization
            </form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </div>
  );
}
