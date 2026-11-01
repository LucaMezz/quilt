import type { ApiKeyPermissions } from "@quilt/auth/permissions";
import { Button, buttonVariants } from "@quilt/ui/components/button";
import { Checkbox } from "@quilt/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@quilt/ui/components/field";
import { Input } from "@quilt/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@quilt/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@quilt/ui/components/select";
import { Textarea } from "@quilt/ui/components/textarea";
import { cn } from "@quilt/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import {
  AddPermission,
  PermissionList,
} from "@/components/api-keys/permission-list";
import { SecretField } from "@/components/api-keys/secret-field";
import { BackLink } from "@/components/settings/back-link";
import { SectionCard } from "@/components/settings/section-card";
import { grantedResources } from "@/lib/api-keys/describe";
import { EXPIRATIONS, expiryDate } from "@/lib/api-keys/expiration";
import { useCreateApiKey } from "@/lib/api-keys/use-api-keys";
import { useOrganizations } from "@/lib/organizations/use-organizations";

export const Route = createFileRoute("/_auth/_app/settings/api-keys/new")({
  component: NewApiKeyPage,
  staticData: { breadcrumb: "New API key" },
});

const schema = z.object({
  name: z.string().trim().min(1, "Give the key a name"),
  description: z.string(),
  expiresInDays: z.number(),
  organizationAccess: z.enum(["all", "selected"]),
  organizationIds: z.array(z.string()),
  permissions: z
    .custom<ApiKeyPermissions>()
    .refine(
      (permissions) => grantedResources(permissions).length > 0,
      "Add at least one permission",
    ),
});

type Created = { id: string; name: string; secret: string };

function NewApiKeyPage() {
  const [created, setCreated] = useState<Created | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink to="/settings/api-keys">All API keys</BackLink>
        <h2 className="font-semibold text-xl">New API key</h2>
        <p className="text-muted-foreground">
          A key lets the quilt CLI, a script or a CI job act as you. It can only
          do what you allow here, and never more than you can.
        </p>
      </div>
      {created ? (
        <CopyNewKey created={created} />
      ) : (
        <NewApiKeyForm onCreated={setCreated} />
      )}
    </div>
  );
}

function CopyNewKey({ created }: { created: Created }) {
  return (
    <SectionCard
      level={3}
      title="Copy your new key"
      description="This is the only time it's shown. Store it somewhere safe before leaving this page."
    >
      <div className="flex flex-col gap-6">
        <SecretField
          id="new-key"
          label={created.name}
          secret={created.secret}
        />
        <Link
          to="/settings/api-keys/$keyId"
          params={{ keyId: created.id }}
          className={cn(buttonVariants(), "self-end")}
        >
          Done
        </Link>
      </div>
    </SectionCard>
  );
}

function NewApiKeyForm({ onCreated }: { onCreated: (key: Created) => void }) {
  const create = useCreateApiKey();
  const organizations = useOrganizations();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      expiresInDays: 30,
      organizationAccess: "all" as "all" | "selected",
      organizationIds: [] as string[],
      permissions: {} as ApiKeyPermissions,
    },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => {
      const name = value.name.trim();
      const { id, secret } = create({
        name,
        description: value.description.trim() || null,
        expiresInDays: value.expiresInDays,
        organizations:
          value.organizationAccess === "all" ? "all" : value.organizationIds,
        permissions: value.permissions,
      });
      toast.success(`Created API key ${name}`);
      onCreated({ id, name, secret });
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <SectionCard level={3} title="Basics">
        <FieldGroup>
          <form.Field name="name">
            {(field) => {
              const isInvalid = !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="key-name">Name</FieldLabel>
                  <Input
                    id="key-name"
                    name={field.name}
                    placeholder="e.g. GitHub Actions deploys"
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Something that tells you where the key is used.
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="key-description">Description</FieldLabel>
                <Textarea
                  id="key-description"
                  name={field.name}
                  placeholder="Optional"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </Field>
            )}
          </form.Field>
          <form.Field name="expiresInDays">
            {(field) => (
              <Field>
                <FieldLabel htmlFor="key-expiration">Expiration</FieldLabel>
                <Select
                  items={EXPIRATIONS}
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (value !== null) field.handleChange(value);
                  }}
                >
                  <SelectTrigger id="key-expiration" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRATIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  The key expires on {expiryDate(field.state.value)}.
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </SectionCard>

      <SectionCard
        level={3}
        title="Organization access"
        description="Which of your organizations the key can reach."
      >
        <FieldGroup>
          <form.Field name="organizationAccess">
            {(field) => (
              <FieldSet>
                <FieldLegend className="sr-only">Organizations</FieldLegend>
                <RadioGroup
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as "all" | "selected")
                  }
                >
                  <FieldLabel htmlFor="access-all">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>All organizations</FieldTitle>
                        <FieldDescription>
                          Every organization you belong to, including ones you
                          join later.
                        </FieldDescription>
                      </FieldContent>
                      <RadioGroupItem id="access-all" value="all" />
                    </Field>
                  </FieldLabel>
                  <FieldLabel htmlFor="access-selected">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Only selected organizations</FieldTitle>
                        <FieldDescription>
                          Just the organizations you choose below.
                        </FieldDescription>
                      </FieldContent>
                      <RadioGroupItem id="access-selected" value="selected" />
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </FieldSet>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.values.organizationAccess}>
            {(access) =>
              access === "selected" && (
                <form.Field
                  name="organizationIds"
                  validators={{
                    onSubmit: ({ value }) =>
                      value.length === 0
                        ? { message: "Choose at least one organization" }
                        : undefined,
                  }}
                >
                  {(field) => {
                    const isInvalid = !field.state.meta.isValid;
                    return (
                      <FieldSet data-invalid={isInvalid}>
                        <FieldLegend variant="label">
                          Choose organizations
                        </FieldLegend>
                        <FieldGroup className="gap-3">
                          {organizations.map((organization) => {
                            const id = `organization-${organization.id}`;
                            const checked = field.state.value.includes(
                              organization.id,
                            );
                            return (
                              <Field
                                key={organization.id}
                                orientation="horizontal"
                              >
                                <Checkbox
                                  id={id}
                                  checked={checked}
                                  aria-invalid={isInvalid}
                                  onCheckedChange={(next) =>
                                    field.handleChange(
                                      next
                                        ? [
                                            ...field.state.value,
                                            organization.id,
                                          ]
                                        : field.state.value.filter(
                                            (value) =>
                                              value !== organization.id,
                                          ),
                                    )
                                  }
                                />
                                <FieldLabel
                                  htmlFor={id}
                                  className="font-normal"
                                >
                                  {organization.name}
                                </FieldLabel>
                              </Field>
                            );
                          })}
                        </FieldGroup>
                        <FieldError errors={field.state.meta.errors} />
                      </FieldSet>
                    );
                  }}
                </form.Field>
              )
            }
          </form.Subscribe>
        </FieldGroup>
      </SectionCard>

      <form.Field name="permissions">
        {(field) => (
          <SectionCard
            level={3}
            title="Permissions"
            description="What the key can do in those organizations and on your account."
            action={
              <AddPermission
                permissions={field.state.value}
                onChange={field.handleChange}
              />
            }
          >
            <div className="flex flex-col gap-3">
              <PermissionList
                permissions={field.state.value}
                onChange={field.handleChange}
                emptyHint="Add a permission for each resource the key needs."
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          </SectionCard>
        )}
      </form.Field>

      <div className="flex justify-end gap-2">
        <Link
          to="/settings/api-keys"
          className={buttonVariants({ variant: "outline" })}
        >
          Cancel
        </Link>
        <Button type="submit">Create key</Button>
      </div>
    </form>
  );
}
