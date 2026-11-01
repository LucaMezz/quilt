import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./context";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { TextareaField } from "./textarea-field";

export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { TextField, TextareaField },
    formComponents: { SubmitButton },
});
