import { toast } from "sonner";
import z from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { SectionCard } from "@/components/settings/section-card";
import { UpdateBar } from "@/components/settings/update-bar";
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

  const form = useAppForm({
    defaultValues: { name: profile.name },
    validators: { onSubmit: schema },
    onSubmit: ({ value }) => {
      const name = value.name.trim();
      updateName(name);
      form.reset({ name });
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
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              id="profile-name"
              label="Name"
              hideLabel
              autoComplete="name"
              description={`${MAX_NAME} characters maximum.`}
              className="max-w-sm"
            />
          )}
        </form.AppField>
        <form.Subscribe
          selector={(state) => state.values.name.trim() !== profile.name}
        >
          {(changed) => (
            <UpdateBar
              changed={changed}
              label="Update name"
              onDiscard={() => form.reset()}
              onUpdate={() => form.handleSubmit()}
            />
          )}
        </form.Subscribe>
      </form>
    </SectionCard>
  );
}
