import { symbols, theme } from "./theme";

// Results go to stdout so they can be piped; everything else goes to stderr.
export const log = {
    success(message: string, detail?: string) {
        console.log(line(theme.success(symbols.success), message, detail));
    },
    info(message: string, detail?: string) {
        console.error(line(theme.brand(symbols.info), message, detail));
    },
    warn(message: string, detail?: string) {
        console.error(line(theme.warning(symbols.warning), message, detail));
    },
    error(message: string, detail?: string) {
        console.error(line(theme.error(symbols.error), message, detail));
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
