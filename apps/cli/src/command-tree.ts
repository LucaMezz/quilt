import type { ArgDef, ArgsDef, CommandDef } from "citty";

export type AnyCommand = CommandDef<ArgsDef>;

type Resolvable<T> = T | Promise<T> | (() => T | Promise<T>);

const resolve = async <T>(value: Resolvable<T>): Promise<T> =>
    typeof value === "function" ? (value as () => T | Promise<T>)() : value;

export interface ArgInfo {
    name: string;
    description?: string;
    /** `--name <value>` style flag, or `<name>` for positionals. */
    flag: string;
    required: boolean;
    default?: string;
    choices?: string[];
}

export interface CommandInfo {
    /** Full invocation, e.g. `["quilt", "health"]`. */
    path: string[];
    description?: string;
    version?: string;
    positionals: ArgInfo[];
    options: ArgInfo[];
    subCommands: CommandInfo[];
}

/**
 * Resolves a citty command (and its subcommands) into plain data. Both the
 * `--help` screen and the generated docs are rendered from this, so they always
 * agree.
 */
export async function describeCommand(
    cmd: AnyCommand,
    parentPath: string[] = [],
): Promise<CommandInfo> {
    const meta = await resolve(cmd.meta ?? {});
    const path = [...parentPath, meta.name ?? ""];
    const isRoot = parentPath.length === 0;
    const args = Object.entries(
        (await resolve(cmd.args ?? {})) as Record<string, ArgDef>,
    );
    const subCommands = await Promise.all(
        Object.values(await resolve(cmd.subCommands ?? {})).map(async (sub) =>
            describeCommand(await resolve(sub), path),
        ),
    );

    const options = args
        .filter(([, def]) => def.type !== "positional")
        .map(([name, def]) => describeArg(name, def));
    // citty handles these itself, so they never appear in `args`.
    options.push({
        name: "help",
        flag: "-h, --help",
        description: "Show help",
        required: false,
    });
    options.push({
        name: "api-key",
        flag: "-k, --api-key <key>",
        description:
            "API key to use instead of QUILT_TOKEN or the one saved by quilt login",
        required: false,
    });
    if (isRoot && meta.version) {
        options.push({
            name: "version",
            flag: "-v, --version",
            description: "Show version",
            required: false,
        });
    }

    return {
        path,
        description: meta.description,
        version: isRoot ? meta.version : undefined,
        positionals: args
            .filter(([, def]) => def.type === "positional")
            .map(([name, def]) => describeArg(name, def)),
        options,
        subCommands,
    };
}

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

/** e.g. `quilt <command> <name> [options]` */
export function usageLine(info: CommandInfo) {
    return [
        info.path.join(" "),
        info.subCommands.length > 0 ? "<command>" : "",
        ...info.positionals.map((arg) => arg.flag),
        "[options]",
    ]
        .filter(Boolean)
        .join(" ");
}

function describeArg(name: string, def: ArgDef): ArgInfo {
    if (def.type === "positional") {
        return {
            name,
            flag: `<${name}>`,
            description: def.description,
            required: def.required !== false && def.default === undefined,
            default:
                def.default === undefined ? undefined : String(def.default),
        };
    }

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

    if (def.type === "boolean" && def.default === true) {
        return {
            name,
            flag: `--no-${name}`,
            description: def.negativeDescription ?? def.description,
            required: false,
        };
    }

    return {
        name,
        flag: [...aliases, `--${name}${value}`].join(", "),
        description: def.description,
        required: def.required === true,
        default: def.default === undefined ? undefined : String(def.default),
        choices: def.type === "enum" ? def.options : undefined,
    };
}
