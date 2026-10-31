import type { ArgInfo, CommandInfo } from "../command-tree";
import { usageLine } from "../command-tree";
import { symbols, theme } from "./theme";

export function renderHelp(root: CommandInfo, info: CommandInfo) {
    const isRoot = info.path.length === 1;
    const name = info.path.join(" ");
    const out: string[] = [""];

    out.push(
        `  ${theme.brandBold(`${symbols.logo} ${root.path[0]}`)}${
            isRoot && root.version ? `  ${theme.muted(`v${root.version}`)}` : ""
        }`,
    );
    if (info.description) out.push(`  ${theme.muted(info.description)}`);

    out.push(
        "",
        section("Usage"),
        `  ${theme.brand(name)}${usageLine(info).slice(name.length)}`,
    );

    if (info.subCommands.length > 0) {
        out.push(
            "",
            section("Commands"),
            ...table(
                info.subCommands.map((sub) => [
                    sub.path.at(-1) ?? "",
                    sub.description ?? "",
                ]),
                theme.brand,
            ),
        );
    }

    if (info.positionals.length > 0) {
        out.push(
            "",
            section("Arguments"),
            ...table(info.positionals.map((arg) => [arg.flag, describe(arg)])),
        );
    }

    if (info.options.length > 0) {
        out.push(
            "",
            section("Options"),
            ...table(info.options.map((arg) => [arg.flag, describe(arg)])),
        );
    }

    out.push(
        "",
        section("Global options"),
        ...table(info.globalOptions.map((arg) => [arg.flag, describe(arg)])),
    );

    if (info.subCommands.length > 0) {
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

function describe(arg: ArgInfo) {
    const parts = [arg.description ?? ""];
    if (arg.choices) parts.push(theme.muted(`(${arg.choices.join(" | ")})`));
    if (arg.default !== undefined) {
        parts.push(theme.muted(`(default: ${arg.default})`));
    }
    return parts.filter(Boolean).join(" ");
}
