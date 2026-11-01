import { Button } from "@quilt/ui/components/button";
import { FieldError } from "@quilt/ui/components/field";
import { Input } from "@quilt/ui/components/input";
import { Textarea } from "@quilt/ui/components/textarea";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function EditableText({
  value,
  label,
  onSave,
  validate,
  addLabel,
  multiline,
  className,
  children,
}: {
  value: string;
  label: string;
  onSave: (next: string) => void;
  validate?: (next: string) => string | undefined;
  addLabel?: string;
  multiline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [problem, setProblem] = useState<string>();
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const closing = useRef(false);
  const editing = draft !== null;
  const errorId = useId();

  useEffect(() => {
    if (editing) {
      closing.current = false;
      field.current?.focus();
      field.current?.select();
    } else if (closing.current) {
      trigger.current?.focus();
    }
  }, [editing]);

  function stop() {
    closing.current = true;
    setDraft(null);
    setProblem(undefined);
  }

  function commit({ keepEditingIfInvalid }: { keepEditingIfInvalid: boolean }) {
    if (draft === null || closing.current) return;
    const next = draft.trim();
    const invalid = validate?.(next);
    if (invalid) {
      if (keepEditingIfInvalid) setProblem(invalid);
      else stop();
      return;
    }
    if (next !== value) onSave(next);
    stop();
  }

  if (!editing) {
    if (!value && addLabel) {
      return (
        <Button
          ref={trigger}
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          onClick={() => setDraft("")}
        >
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          {addLabel}
        </Button>
      );
    }
    return (
      <>
        {children}
        <Button
          ref={trigger}
          variant="ghost"
          size="icon-xs"
          aria-label={`Edit ${label.toLowerCase()}`}
          title={`Edit ${label.toLowerCase()}`}
          className="text-muted-foreground"
          onClick={() => setDraft(value)}
        >
          <PencilIcon aria-hidden="true" />
        </Button>
      </>
    );
  }

  const shared = {
    "aria-label": label,
    "aria-invalid": problem ? true : undefined,
    "aria-describedby": problem ? errorId : undefined,
    ref: field,
    value: draft,
    className,
    onBlur: () => commit({ keepEditingIfInvalid: false }),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        stop();
      } else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        commit({ keepEditingIfInvalid: true });
      }
    },
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      {multiline ? (
        <Textarea
          {...shared}
          onChange={(event) => {
            setDraft(event.target.value);
            setProblem(undefined);
          }}
        />
      ) : (
        <Input
          {...shared}
          onChange={(event) => {
            setDraft(event.target.value);
            setProblem(undefined);
          }}
        />
      )}
      {problem ? (
        <FieldError id={errorId}>{problem}</FieldError>
      ) : (
        <p className="text-muted-foreground text-xs">
          Enter to save, Esc to cancel
          {multiline ? ", Shift+Enter for a new line" : ""}.
        </p>
      )}
    </div>
  );
}
