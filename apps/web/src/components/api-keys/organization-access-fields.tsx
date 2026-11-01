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
import { RadioGroup, RadioGroupItem } from "@quilt/ui/components/radio-group";
import { useId } from "react";

import type { OrganizationChoice } from "@/lib/api-keys/organization-access";
import { useOrganizations } from "@/lib/organizations/use-organizations";

export function OrganizationAccessFields({
  value,
  onChange,
  errors,
}: {
  value: OrganizationChoice;
  onChange: (value: OrganizationChoice) => void;
  errors?: Array<{ message?: string } | undefined>;
}) {
  const organizations = useOrganizations();
  const prefix = useId();
  const isInvalid = Boolean(errors?.length);

  function toggle(id: string, checked: boolean) {
    onChange({
      ...value,
      ids: checked
        ? [...value.ids, id]
        : value.ids.filter((selected) => selected !== id),
    });
  }

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend className="sr-only">Organizations</FieldLegend>
        <RadioGroup
          value={value.mode}
          onValueChange={(mode) =>
            onChange({ ...value, mode: mode as OrganizationChoice["mode"] })
          }
        >
          <FieldLabel htmlFor={`${prefix}-all`}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>All organizations</FieldTitle>
                <FieldDescription>
                  Every organization you belong to, including ones you join
                  later.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem id={`${prefix}-all`} value="all" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor={`${prefix}-selected`}>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Only selected organizations</FieldTitle>
                <FieldDescription>
                  Just the organizations you choose below.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem id={`${prefix}-selected`} value="selected" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
      {value.mode === "selected" && (
        <FieldSet data-invalid={isInvalid}>
          <FieldLegend variant="label">Choose organizations</FieldLegend>
          <FieldGroup className="gap-3">
            {organizations.map((organization) => {
              const id = `${prefix}-${organization.id}`;
              return (
                <Field key={organization.id} orientation="horizontal">
                  <Checkbox
                    id={id}
                    checked={value.ids.includes(organization.id)}
                    aria-invalid={isInvalid}
                    onCheckedChange={(checked) =>
                      toggle(organization.id, checked)
                    }
                  />
                  <FieldLabel htmlFor={id} className="font-normal">
                    {organization.name}
                  </FieldLabel>
                </Field>
              );
            })}
          </FieldGroup>
          <FieldError errors={errors} />
        </FieldSet>
      )}
    </FieldGroup>
  );
}
