import pg from "pg";

async function withAdminClient<T>(
    adminUrl: string,
    run: (client: pg.Client) => Promise<T>,
) {
    const client = new pg.Client({ connectionString: adminUrl });
    await client.connect();
    try {
        return await run(client);
    } finally {
        await client.end();
    }
}

export async function createDatabase(adminUrl: string, name: string) {
    await withAdminClient(adminUrl, (client) =>
        client.query(`CREATE DATABASE ${client.escapeIdentifier(name)}`),
    );
    const url = new URL(adminUrl);
    url.pathname = `/${name}`;
    return url.toString();
}

export async function dropDatabase(adminUrl: string, name: string) {
    await withAdminClient(adminUrl, (client) =>
        client.query(
            `DROP DATABASE IF EXISTS ${client.escapeIdentifier(name)} WITH (FORCE)`,
        ),
    );
}
