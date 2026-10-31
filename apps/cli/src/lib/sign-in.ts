import { log } from "../ui/log";
import { theme } from "../ui/theme";
import { passedKey } from "./credentials";

export function hintSignIn(again = false) {
    log.hint(
        `Run ${theme.brand("quilt login")} to sign in${again ? " again" : ""}, or pass an API key with ${theme.brand("--api-key")} or QUILT_TOKEN.`,
    );
}

export function reportPassedKeyRejected() {
    const passed = passedKey();
    if (!passed) return false;
    log.error(`The API key ${passed.from} isn't valid or has expired`);
    log.hint(`${passed.fix} to use the key saved by quilt login instead.`);
    return true;
}
