import { Button } from "@quilt/ui/components/button";
import { Field, FieldError, FieldLabel } from "@quilt/ui/components/field";
import { Input } from "@quilt/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";

import { SectionCard } from "@/components/settings/section-card";
import { type Profile, useUpdateProfileName } from "@/lib/profile/use-profile";

const MAX_NAME = 64;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(MAX_NAME, `Use ${MAX_NAME} characters or fewer`),
});

export function ProfileName({ profile }: { profile: Profile }) {
  const updateName = useUpdateProfileName();

  const form = useForm({
    defaultValues: { name: profile.name },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => {
      const name = value.name.trim();
      updateName(name);
      form.setFieldValue("name", name);
      toast.success("Name updated");
    },
  });

  return (
    <SectionCard
      title="Name"
      description="Your full name, or the name you'd like people to see in quilt."
    >
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => {
            const isInvalid = !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid} className="max-w-sm">
                <FieldLabel htmlFor="profile-name" className="sr-only">
                  Name
                </FieldLabel>
                <Input
                  id="profile-name"
                  name={field.name}
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            );
          }}
        </form.Field>
        <div className="flex items-center justify-between gap-4 border-t pt-4">
          <p className="text-muted-foreground text-sm">
            {MAX_NAME} characters maximum.
          </p>
          <form.Subscribe
            selector={(state) => state.values.name.trim() !== profile.name}
          >
            {(changed) => (
              <Button type="submit" disabled={!changed}>
                Save
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </SectionCard>
  );
}
