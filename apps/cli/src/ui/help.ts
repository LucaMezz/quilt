import type { ArgDef, ArgsDef, CommandDef } from "citty";

import { symbols, theme } from "./theme";

type AnyCommand = CommandDef<ArgsDef>;
type Resolvable<T> = T | Promise<T> | (() => T | Promise<T>);

const resolve = async <T>(value: Resolvable<T>): Promise<T> =>
    typeof value === "function" ? (value as () => T | Promise<T>)() : value;

/** Finds the command that `rawArgs` points at, e.g. `health --help` → health. */
export async function findCommand(root: AnyCommand, rawArgs: string[]) {
    let cmd = root;
    const path: string[] = [];
    for (const arg of rawArgs) {
        if (arg.startsWith("-")) continue;
        const subCommands = await resolve(cmd.subCommands ?? {});
        const sub = subCommands[arg];
        if (!sub) break;
        cmd = await resolve(sub);
        path.push(arg);
    }
    return { cmd, path };
}

export async function renderHelp(
    root: AnyCommand,
    cmd: AnyCommand,
    path: string[],
) {
    const rootMeta = await resolve(root.meta ?? {});
    const meta = await resolve(cmd.meta ?? {});
    const args = Object.entries(
        (await resolve(cmd.args ?? {})) as Record<string, ArgDef>,
    );
    const subCommands = Object.entries(await resolve(cmd.subCommands ?? {}));
    const isRoot = path.length === 0;
    const name = [rootMeta.name ?? "", ...path].join(" ");

    const out: string[] = [""];

    out.push(
        `  ${theme.brandBold(`${symbols.logo} ${rootMeta.name}`)}${
            isRoot && rootMeta.version
                ? `  ${theme.muted(`v${rootMeta.version}`)}`
                : ""
        }`,
    );
    if (meta.description) out.push(`  ${theme.muted(meta.description)}`);

    const positionals = args.filter(([, def]) => def.type === "positional");
    const usage = [
        theme.brand(name),
        subCommands.length > 0 ? "<command>" : "",
        ...positionals.map(([argName]) => `<${argName}>`),
        "[options]",
    ].filter(Boolean);
    out.push("", section("Usage"), `  ${usage.join(" ")}`);

    if (subCommands.length > 0) {
        const rows = await Promise.all(
            subCommands.map(async ([subName, sub]) => {
                const subMeta = await resolve((await resolve(sub)).meta ?? {});
                return [subName, subMeta.description ?? ""] as const;
            }),
        );
        out.push("", section("Commands"), ...table(rows, theme.brand));
    }

    if (positionals.length > 0) {
        out.push(
            "",
            section("Arguments"),
            ...table(
                positionals.map(([argName, def]) => [
                    `<${argName}>`,
                    def.description ?? "",
                ]),
            ),
        );
    }

    const options = args
        .filter(([, def]) => def.type !== "positional")
        .map(
            ([argName, def]) =>
                [formatOption(argName, def), describe(def)] as const,
        );
    options.push(["-h, --help", "Show help"]);
    if (isRoot && rootMeta.version)
        options.push(["-v, --version", "Show version"]);
    out.push("", section("Options"), ...table(options));

    if (subCommands.length > 0) {
        out.push(
            "",
            `  ${theme.muted(`Run ${theme.brand(`${name} <command> --help`)} for details on a command.`)}`,
        );
    }

    out.push("");
    return out.join("\n");
}

function section(title: string) {
    return `  ${theme.heading(title)}`;
}

function table(
    rows: ReadonlyArray<readonly [string, string]>,
    style = (s: string) => s,
) {
    const width = Math.max(...rows.map(([left]) => left.length));
    return rows.map(
        ([left, right]) =>
            `    ${style(left.padEnd(width))}   ${theme.muted(right)}`,
    );
}

function formatOption(name: string, def: ArgDef) {
    const aliases = (
        "alias" in def && def.alias
            ? Array.isArray(def.alias)
                ? def.alias
                : [def.alias]
            : []
    ).map((alias) => (alias.length === 1 ? `-${alias}` : `--${alias}`));
    const value =
        def.type === "string" || def.type === "enum"
            ? ` <${"valueHint" in def && def.valueHint ? def.valueHint : name}>`
            : "";
    return [...aliases, `--${name}${value}`].join(", ");
}

function describe(def: ArgDef) {
    const parts = [def.description ?? ""];
    if (def.type === "enum" && def.options) {
        parts.push(theme.muted(`(${def.options.join(" | ")})`));
    }
    if ("default" in def && def.default !== undefined) {
        parts.push(theme.muted(`(default: ${String(def.default)})`));
    }
    return parts.filter(Boolean).join(" ");
}
