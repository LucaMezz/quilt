import { Card, CardContent } from "@quilt/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@quilt/ui/components/field";
import { cn } from "@quilt/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { useAppForm } from "@/components/form/use-app-form";
import { authClient } from "@/lib/auth-client";

import { AuthPanel } from "./auth-panel";
import Loader from "./loader";
import { Logo } from "./logo";

interface LoginFormProps extends React.ComponentProps<"div"> {
  redirect?: string;
}

export function LoginForm({ redirect, className, ...props }: LoginFormProps) {
  const { isPending } = authClient.useSession();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: redirect ?? "/organizations",
        },
        {
          onSuccess: () => {
            toast.success("Sign in successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
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
                <h1 className="font-bold text-2xl">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to your quilt account
                </p>
              </div>
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
                    autoComplete="current-password"
                  />
                )}
              </form.AppField>
              <Field>
                <form.AppForm>
                  <form.SubmitButton pending="Signing in...">
                    Sign in
                  </form.SubmitButton>
                </form.AppForm>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <AuthPanel src="/auth/login.webp" />
        </CardContent>
      </Card>
    </div>
  );
}
