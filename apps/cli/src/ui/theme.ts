import chalk from "chalk";

// quilt's brand accent. chalk downsamples it to 256 or 16 colours on terminals
// without truecolor, and drops colour entirely for NO_COLOR or piped output.
const BRAND = "#E8692F";

export const theme = {
    brand: chalk.hex(BRAND),
    brandBold: chalk.hex(BRAND).bold,
    heading: chalk.bold,
    muted: chalk.dim,
    code: chalk.hex(BRAND),
    link: chalk.underline,
};

export const symbols = {
    logo: "◆",
    pointer: "›",
    dot: "·",
};
