import Table from "cli-table3";

import { theme } from "./theme";

const NO_BORDERS = {
    top: "",
    "top-mid": "",
    "top-left": "",
    "top-right": "",
    bottom: "",
    "bottom-mid": "",
    "bottom-left": "",
    "bottom-right": "",
    left: "",
    "left-mid": "",
    mid: "",
    "mid-mid": "",
    right: "",
    "right-mid": "",
    middle: "",
};

function render(head: string[], rows: string[][]) {
    const output = new Table({
        head,
        chars: NO_BORDERS,
        style: { head: [], border: [], "padding-left": 0, "padding-right": 3 },
    });
    output.push(...rows);
    return output.toString().replace(/ +$/gm, "");
}

export function table(head: string[], rows: string[][]) {
    return render(
        head.map((title) => theme.heading(title)),
        rows,
    );
}

export function details(fields: [label: string, value: string][]) {
    return render(
        [],
        fields.map(([label, value]) => [theme.muted(label), value]),
    );
}
