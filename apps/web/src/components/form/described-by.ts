export function describedBy(
    id: string,
    { description, invalid }: { description: boolean; invalid: boolean },
) {
    const ids = {
        description: description ? `${id}-description` : undefined,
        error: invalid ? `${id}-error` : undefined,
    };
    const joined = [ids.description, ids.error].filter(Boolean).join(" ");
    return { ...ids, describedBy: joined || undefined };
}
