import type { CommandUnknownOpts } from "@commander-js/extra-typings";

export function runCommand(
    cmd: CommandUnknownOpts,
    { rawArgs }: { rawArgs: string[] },
) {
    return cmd.exitOverride().parseAsync(rawArgs, { from: "user" });
}
