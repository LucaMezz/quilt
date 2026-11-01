import z from "zod";

const VIEWS = ["grid", "list", "table"] as const;

export type View = (typeof VIEWS)[number];

export const viewSearch = z.object({
    view: z.enum(VIEWS).optional().catch(undefined),
});
