import type { Context } from "#/context";

export class HandlerReached extends Error {}

const unreachable = new Proxy(
    {},
    {
        get() {
            throw new HandlerReached();
        },
    },
) as never;

export function stubContext(): Context {
    return {
        auth: unreachable,
        db: unreachable,
        storage: unreachable,
        headers: new Headers(),
        appsDomain: "example.com",
        caller: { kind: "session", userId: "user", session: unreachable },
    };
}
