#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const WARN_AT = 150;
const BLOCK_AT = 400;

function git(args, input) {
    return execFileSync("git", args, {
        encoding: "utf8",
        input,
        maxBuffer: 64 * 1024 * 1024,
    });
}

function parseArgs(argv) {
    const options = { base: "origin/main", staged: false };
    for (let index = 0; index < argv.length; index++) {
        if (argv[index] === "--staged") options.staged = true;
        else if (argv[index] === "--base") options.base = argv[++index];
    }
    return options;
}

function mergeBase(base) {
    try {
        return git(["merge-base", "HEAD", base]).trim();
    } catch {
        return "HEAD";
    }
}

function parseNumstat(output) {
    const tokens = output.split("\0");
    const files = [];
    let index = 0;
    while (index < tokens.length) {
        const [added, deleted, path] = tokens[index].split("\t");
        index += 1;
        if (deleted === undefined) continue;
        let file = path;
        if (!file) {
            file = tokens[index + 1];
            index += 2;
        }
        files.push({
            path: file,
            lines: added === "-" ? 0 : Number(added) + Number(deleted),
        });
    }
    return files;
}

function excludedPaths(paths) {
    if (paths.length === 0) return new Set();
    const output = git(
        [
            "check-attr",
            "-z",
            "--stdin",
            "linguist-generated",
            "linguist-vendored",
        ],
        `${paths.join("\0")}\0`,
    ).split("\0");
    const excluded = new Set();
    for (let index = 0; index + 2 < output.length; index += 3) {
        if (output[index + 2] === "true" || output[index + 2] === "set") {
            excluded.add(output[index]);
        }
    }
    return excluded;
}

const options = parseArgs(process.argv.slice(2));
const from = mergeBase(options.base);
const range = options.staged ? ["--cached", from] : [from, "HEAD"];
const files = parseNumstat(git(["diff", "--numstat", "-z", "-M", ...range]));
const excluded = excludedPaths(files.map((file) => file.path));
const counted = files.filter((file) => !excluded.has(file.path));
const total = counted.reduce((sum, file) => sum + file.lines, 0);

if (total < WARN_AT) process.exit(0);

const largest = counted
    .sort((left, right) => right.lines - left.lines)
    .slice(0, 8)
    .map((file) => `  ${String(file.lines).padStart(5)}  ${file.path}`)
    .join("\n");
const scope = options.staged
    ? `this branch (including staged changes) against ${options.base}`
    : `this PR against ${options.base}`;

if (total < BLOCK_AT) {
    console.warn(
        `Change size: ${total} lines changed in ${scope}. Aim for ~100; ${BLOCK_AT} is the limit.\n${largest}\nConsider landing part of this in its own PR.`,
    );
    process.exit(0);
}

console.error(
    `Change size: ${total} lines changed in ${scope}, over the ${BLOCK_AT}-line limit (aim for ~100).\n${largest}\nSplit it into a series of PRs, each one self-contained (for example schema, then service, then endpoint), with refactors separate from features. Generated and vendored files (see .gitattributes) don't count.`,
);
process.exit(1);
