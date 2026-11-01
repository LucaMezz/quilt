import { buttonVariants } from "@quilt/ui/components/button";
import { FieldGroup } from "@quilt/ui/components/field";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { PageHeader } from "@/components/app/page-header";
import { useAppForm } from "@/components/form/use-app-form";
import { BackLink } from "@/components/settings/back-link";
import { SectionCard } from "@/components/settings/section-card";
import { appNameProblem } from "@/lib/apps/name";
import {
  APPS_DOMAIN,
  useAppNameTaken,
  useCreateApp,
} from "@/lib/apps/use-apps";

export const Route = createFileRoute("/_auth/organizations/$org/apps/new")({
  component: NewAppPage,
  staticData: { breadcrumb: "New app" },
});

function NewAppPage() {
  const { org } = Route.useParams();
  const isTaken = useAppNameTaken();
  const create = useCreateApp();
  const navigate = Route.useNavigate();

  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onSubmit: z.object({
        name: z.string().superRefine((name, context) => {
          const problem = isTaken(name)
            ? "That name is already taken"
            : appNameProblem(name);
          if (problem) context.addIssue({ code: "custom", message: problem });
        }),
      }),
    },
    onSubmit: ({ value }) => {
      const app = create({ organization: org, name: value.name });
      toast.success(`Created app ${app.name}`);
      navigate({ to: "/organizations/$org/apps", params: { org } });
    },
  });

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <BackLink to="/organizations/$org/apps" params={{ org }}>
          All apps
        </BackLink>
        <PageHeader
          title="New app"
          description="An app gets its own hostname. Deploy an image to it once it's created."
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
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Name"
                  placeholder="e.g. api"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  description={
                    <>
                      Served at{" "}
                      <code>
                        {field.state.value || "api"}.{APPS_DOMAIN}
                      </code>
                      . Lowercase letters, numbers and dashes. It must be unique
                      across all organizations and can't be changed later.
                    </>
                  }
                />
              )}
            </form.AppField>
          </FieldGroup>
        </SectionCard>
        <div className="flex justify-end gap-2">
          <Link
            to="/organizations/$org/apps"
            params={{ org }}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
          <form.AppForm>
            <form.SubmitButton pending="Creating app...">
              Create app
            </form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </div>
  );
}
