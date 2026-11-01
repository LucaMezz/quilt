import type {
    Argument,
    CommandUnknownOpts,
    Option,
} from "@commander-js/extra-typings";

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
    globalOptions: ArgInfo[];
    subCommands: CommandInfo[];
}

/**
 * Resolves a Commander command (and its subcommands) into plain data. Both the
 * `--help` screen and the generated docs are rendered from this, so they always
 * agree.
 */
export function describeCommand(cmd: CommandUnknownOpts): CommandInfo {
    const root = rootOf(cmd);
    const inherited = root.options.filter(
        (option) => option.attributeName() !== "version",
    );
    const visible = cmd.createHelp().visibleOptions(cmd);
    const help = visible.filter((option) => !cmd.options.includes(option));

    return {
        path: pathOf(cmd),
        description: cmd.description() || undefined,
        version: cmd === root ? root.version() : undefined,
        positionals: cmd.registeredArguments.map(describeArgument),
        options: visible
            .filter(
                (option) =>
                    cmd.options.includes(option) && !inherited.includes(option),
            )
            .map(describeOption),
        globalOptions: [...inherited, ...help].map(describeOption),
        subCommands: cmd.commands.map(describeCommand),
    };
}

export function pathOf(cmd: CommandUnknownOpts): string[] {
    return cmd.parent ? [...pathOf(cmd.parent), cmd.name()] : [cmd.name()];
}

export function rootOf(cmd: CommandUnknownOpts): CommandUnknownOpts {
    return cmd.parent ? rootOf(cmd.parent) : cmd;
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

function describeArgument(argument: Argument): ArgInfo {
    return {
        name: argument.name(),
        flag: argument.required
            ? `<${argument.name()}>`
            : `[${argument.name()}]`,
        description: argument.description || undefined,
        required: argument.required,
        default: stringOrUndefined(argument.defaultValue),
        choices: argument.argChoices,
    };
}

function describeOption(option: Option): ArgInfo {
    return {
        name: option.name(),
        flag: option.flags,
        description: option.description || undefined,
        required: option.mandatory,
        default: stringOrUndefined(option.defaultValue),
        choices: option.argChoices,
    };
}

function stringOrUndefined(value: unknown) {
    return value === undefined ? undefined : String(value);
}
