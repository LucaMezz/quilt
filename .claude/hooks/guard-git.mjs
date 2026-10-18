#!/usr/bin/env node
import { readFileSync } from "node:fs";

const RULES = [
    {
        pattern: /\bgit\b(?:\s+-c\s+\S+)*\s+commit\b[^|;&]*\s(?:--no-verify\b|-[a-zA-Z]*n[a-zA-Z]*\b)/,
        reason: "Don't skip the pre-commit hook: it runs lint-staged. Fix what it reports instead.",
    },
    {
        pattern: /\bgit\b[^|;&]*\s+push\b[^|;&]*\s--no-verify\b/,
        reason: "Don't skip the pre-push hook: it runs type checks and tests.",
    },
    {
        pattern: /\bHUSKY=0\b|core\.hooksPath/,
        reason: "Don't disable the git hooks; they enforce linting, commit messages and tests.",
    },
    {
        pattern: /\bgit\b[^|;&]*\s+push\b[^|;&]*(?:\s|:)(?:refs\/heads\/)?main(?:\s|$)/,
        reason: "Don't push to main. Push a branch and open a pull request; changes land by squash merge once CI passes.",
    },
];

function command() {
    try {
        const event = JSON.parse(readFileSync(0, "utf8"));
        return typeof event?.tool_input?.command === "string"
            ? event.tool_input.command
            : "";
    } catch {
        return "";
    }
}

function withoutQuotedText(text) {
    return text
        .split("<<")[0]
        .replace(/"(?:[^"\\]|\\.)*"|'[^']*'/g, '""');
}

const input = withoutQuotedText(command());
const match = RULES.find((rule) => rule.pattern.test(input));
if (match) {
    process.stdout.write(
        JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: match.reason,
            },
        }),
    );
}
