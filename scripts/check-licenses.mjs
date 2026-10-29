import { execFileSync } from "node:child_process";

const allowedLicenses = new Set([
    "0BSD",
    "Apache-2.0",
    "BlueOak-1.0.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "CC-BY-4.0",
    "CC0-1.0",
    "ISC",
    "MIT",
    "MIT-0",
    "MPL-2.0",
    "OFL-1.1",
    "PSF-2.0",
    "Python-2.0",
    "Unlicense",
]);

const allowedPackages = [
    { name: /^@img\/sharp-libvips-/, license: "LGPL-3.0-or-later" },
];

function isAllowed(expression) {
    return expression
        .replace(/[()]/g, "")
        .split(" OR ")
        .some((alternative) =>
            alternative
                .split(" AND ")
                .every((license) => allowedLicenses.has(license.trim())),
        );
}

const report = JSON.parse(
    execFileSync("pnpm", ["licenses", "list", "--recursive", "--json"], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
    }),
);

const violations = Object.entries(report).flatMap(([license, packages]) =>
    isAllowed(license)
        ? []
        : packages
              .filter(
                  ({ name }) =>
                      !allowedPackages.some(
                          (exception) =>
                              exception.license === license &&
                              exception.name.test(name),
                      ),
              )
              .map(
                  ({ name, versions }) =>
                      `${name}@${versions.join(", ")}: ${license}`,
              ),
);

const total = Object.values(report).reduce(
    (sum, packages) => sum + packages.length,
    0,
);

if (violations.length > 0) {
    process.stderr.write(
        `${violations.length} of ${total} packages have a license that is not allowed:\n${violations.map((line) => `  ${line}`).join("\n")}\n`,
    );
    process.exitCode = 1;
} else {
    process.stdout.write(`All ${total} packages have an allowed license.\n`);
}
