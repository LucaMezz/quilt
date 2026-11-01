import { Card, CardContent } from "@quilt/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@quilt/ui/components/field";
import { cn } from "@quilt/ui/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { authClient } from "@/lib/auth-client";

import { AuthPanel } from "./auth-panel";
import Loader from "./loader";
import { Logo } from "./logo";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { isPending } = authClient.useSession();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/organizations",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.email("Invalid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
          confirmPassword: z.string(),
        })
        .refine((value) => value.password === value.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <Logo className="self-center" />
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="font-bold text-2xl">Create your account</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  Enter your details below to create your account
                </p>
              </div>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField label="Name" autoComplete="name" />
                )}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="Email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="email"
                  />
                )}
              </form.AppField>
              <form.AppField name="password">
                {(field) => (
                  <field.TextField
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    description="Must be at least 8 characters long."
                  />
                )}
              </form.AppField>
              <form.AppField name="confirmPassword">
                {(field) => (
                  <field.TextField
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>
              <Field>
                <form.AppForm>
                  <form.SubmitButton pending="Creating account...">
                    Create Account
                  </form.SubmitButton>
                </form.AppForm>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <Link to="/login">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <AuthPanel src="/auth/signup.webp" />
        </CardContent>
      </Card>
    </div>
  );
}
