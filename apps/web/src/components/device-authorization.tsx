import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@quilt/ui/components/alert";
import { Button } from "@quilt/ui/components/button";
import { Card, CardContent } from "@quilt/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@quilt/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@quilt/ui/components/input-otp";
import { cn } from "@quilt/ui/lib/utils";
import { CircleCheck, CircleX, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { useAppForm } from "@/components/form/use-app-form";
import {
  formatUserCode,
  isCompleteUserCode,
  normalizeUserCode,
  USER_CODE_LENGTH,
  USER_CODE_PATTERN,
} from "@/lib/user-code";

import { Logo } from "./logo";

interface DeviceRequest {
  clientId: string;
  scopes: string[];
}

type Step =
  | { kind: "enter" }
  | { kind: "confirm"; userCode: string; request: DeviceRequest }
  | { kind: "approved" }
  | { kind: "denied" };

interface DeviceAuthorizationProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  initialCode?: string;
  onVerify: (userCode: string) => Promise<DeviceRequest>;
  onApprove: (userCode: string) => Promise<void>;
  onDeny: (userCode: string) => Promise<void>;
}

export function DeviceAuthorization({
  initialCode,
  onVerify,
  onApprove,
  onDeny,
  className,
  ...props
}: DeviceAuthorizationProps) {
  const [step, setStep] = useState<Step>({ kind: "enter" });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent className="p-6 md:p-8">
          {step.kind === "enter" && (
            <EnterCode
              initialCode={initialCode}
              onVerify={onVerify}
              onVerified={(userCode, request) =>
                setStep({ kind: "confirm", userCode, request })
              }
            />
          )}
          {step.kind === "confirm" && (
            <ConfirmRequest
              userCode={step.userCode}
              request={step.request}
              onApprove={onApprove}
              onDeny={onDeny}
              onDone={(kind) => setStep({ kind })}
              onBack={() => setStep({ kind: "enter" })}
            />
          )}
          {step.kind === "approved" && (
            <Outcome
              icon={<CircleCheck className="size-6 text-primary" />}
              title="Device connected"
              description="You can close this tab and return to your terminal."
            />
          )}
          {step.kind === "denied" && (
            <Outcome
              icon={<CircleX className="size-6 text-destructive" />}
              title="Request denied"
              description="The device was not signed in. If you didn't start this request, someone else may be trying to access your account."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <>
      <Logo className="self-center" />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">{title}</h1>
        <p className="text-balance text-muted-foreground">{description}</p>
      </div>
    </>
  );
}

function EnterCode({
  initialCode,
  onVerify,
  onVerified,
}: {
  initialCode?: string;
  onVerify: (userCode: string) => Promise<DeviceRequest>;
  onVerified: (userCode: string, request: DeviceRequest) => void;
}) {
  const [verifyError, setVerifyError] = useState<string>();

  const form = useAppForm({
    defaultValues: {
      userCode: normalizeUserCode(initialCode ?? ""),
    },
    onSubmit: async ({ value }) => {
      try {
        onVerified(value.userCode, await onVerify(value.userCode));
      } catch {
        setVerifyError("This code is invalid or has expired");
      }
    },
    validators: {
      onSubmit: z.object({
        userCode: z
          .string()
          .refine(
            isCompleteUserCode,
            "Enter the 8-character code shown in your terminal",
          ),
      }),
    },
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <StepHeader
          title="Connect a device"
          description="Enter the code shown in your terminal"
        />
        <form.Field name="userCode">
          {(field) => {
            const errors = [
              ...field.state.meta.errors,
              ...(verifyError ? [{ message: verifyError }] : []),
            ];
            const isInvalid = errors.length > 0;
            return (
              <Field data-invalid={isInvalid} className="items-center">
                <FieldLabel htmlFor={field.name} className="sr-only">
                  Device code
                </FieldLabel>
                <InputOTP
                  id={field.name}
                  name={field.name}
                  maxLength={USER_CODE_LENGTH}
                  pattern={USER_CODE_PATTERN}
                  pasteTransformer={normalizeUserCode}
                  autoFocus
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    setVerifyError(undefined);
                    field.handleChange(value.toUpperCase());
                  }}
                  aria-invalid={isInvalid}
                  containerClassName="justify-center gap-1.5 md:gap-2"
                >
                  <CodeSlots from={0} invalid={isInvalid} />
                  <InputOTPSeparator />
                  <CodeSlots from={USER_CODE_LENGTH / 2} invalid={isInvalid} />
                </InputOTP>
                <FieldError className="text-center" errors={errors} />
              </Field>
            );
          }}
        </form.Field>
        <Field>
          <form.AppForm>
            <form.SubmitButton pending="Checking...">
              Continue
            </form.SubmitButton>
          </form.AppForm>
        </Field>
        <FieldDescription className="text-center">
          Run <code className="font-mono">quilt login</code> to get a new code.
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

function CodeSlots({ from, invalid }: { from: number; invalid: boolean }) {
  return (
    <InputOTPGroup>
      {Array.from({ length: USER_CODE_LENGTH / 2 }, (_, i) => from + i).map(
        (index) => (
          <InputOTPSlot
            key={index}
            index={index}
            aria-invalid={invalid}
            className="size-8 font-medium text-sm md:size-10 md:text-base"
          />
        ),
      )}
    </InputOTPGroup>
  );
}

function ConfirmRequest({
  userCode,
  request,
  onApprove,
  onDeny,
  onDone,
  onBack,
}: {
  userCode: string;
  request: DeviceRequest;
  onApprove: (userCode: string) => Promise<void>;
  onDeny: (userCode: string) => Promise<void>;
  onDone: (kind: "approved" | "denied") => void;
  onBack: () => void;
}) {
  const [pending, setPending] = useState<"approve" | "deny">();

  async function decide(decision: "approve" | "deny") {
    setPending(decision);
    try {
      await (decision === "approve" ? onApprove : onDeny)(userCode);
      onDone(decision === "approve" ? "approved" : "denied");
    } catch {
      toast.error(
        `Couldn't ${decision} this device. The code may have expired.`,
      );
      setPending(undefined);
    }
  }

  return (
    <FieldGroup>
      <StepHeader
        title="Authorize device"
        description={
          <>
            <span className="font-medium text-foreground">
              {request.clientId}
            </span>{" "}
            wants to sign in to your quilt account
          </>
        }
      />
      <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/40 p-4 text-center">
        <span className="font-semibold text-2xl tabular-nums tracking-[0.2em]">
          {formatUserCode(userCode)}
        </span>
        <span className="text-muted-foreground text-xs">
          Check that this matches the code in your terminal
        </span>
      </div>
      {request.scopes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm">Requested access</p>
          <ul className="flex flex-wrap gap-1.5">
            {request.scopes.map((scope) => (
              <li
                key={scope}
                className="rounded-md border bg-muted/40 px-1.5 py-0.5 font-mono text-xs"
              >
                {scope}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Alert>
        <ShieldAlert />
        <AlertTitle>Only approve requests you started</AlertTitle>
        <AlertDescription>
          Approving gives this device full access to your account. If someone
          sent you this code or link, deny the request.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={pending !== undefined}
          onClick={() => decide("deny")}
        >
          {pending === "deny" ? "Denying..." : "Deny"}
        </Button>
        <Button
          disabled={pending !== undefined}
          onClick={() => decide("approve")}
        >
          {pending === "approve" ? "Approving..." : "Approve"}
        </Button>
      </div>
      <FieldDescription className="text-center">
        Wrong code?{" "}
        <button
          type="button"
          className="cursor-pointer underline underline-offset-4 hover:text-primary disabled:cursor-not-allowed"
          disabled={pending !== undefined}
          onClick={onBack}
        >
          Enter a different one
        </button>
      </FieldDescription>
    </FieldGroup>
  );
}

function Outcome({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 py-4 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-2xl">{title}</h1>
        <p className="text-balance text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
