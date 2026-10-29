import logSymbols from "log-symbols";

import { symbols, theme } from "./theme";

// Everything here is meant for people, so it goes to stderr and stdout stays
// free for data that scripts consume.
export const log = {
    success(message: string, detail?: string) {
        console.error(line(logSymbols.success, message, detail));
    },
    info(message: string, detail?: string) {
        console.error(line(logSymbols.info, message, detail));
    },
    warn(message: string, detail?: string) {
        console.error(line(logSymbols.warning, message, detail));
    },
    error(message: string, detail?: string) {
        console.error(line(logSymbols.error, message, detail));
    },
    hint(message: string) {
        console.error(`  ${theme.muted(`${symbols.pointer} ${message}`)}`);
    },
};

function line(symbol: string, message: string, detail?: string) {
    return detail
        ? `${symbol} ${message}  ${theme.muted(detail)}`
        : `${symbol} ${message}`;
}
