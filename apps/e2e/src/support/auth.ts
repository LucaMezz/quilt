import { type ApiSession, createApiSession } from "./api";

export type TestUser = ApiSession & {
    user: { id: string; name: string; email: string };
};

export async function signUp(baseUrl: string, name: string): Promise<TestUser> {
    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: baseUrl },
        body: JSON.stringify({
            name,
            email: `${name}@e2e.quilt.test`,
            password: "e2e-password-123",
        }),
    });
    if (!response.ok) {
        throw new Error(
            `Sign-up failed with ${response.status}: ${await response.text()}`,
        );
    }

    const cookie = response.headers
        .getSetCookie()
        .map((header) => header.split(";", 1)[0])
        .join("; ");
    const { user } = (await response.json()) as { user: TestUser["user"] };

    return {
        ...createApiSession(baseUrl, cookie),
        user: { id: user.id, name: user.name, email: user.email },
    };
}
