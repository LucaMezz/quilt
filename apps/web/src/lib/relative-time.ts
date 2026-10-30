const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * DAY],
    ["month", 30 * DAY],
    ["day", DAY],
    ["hour", HOUR],
    ["minute", MINUTE],
];

const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(date: Date, now = new Date()) {
    const offset = date.getTime() - now.getTime();
    for (const [unit, length] of UNITS) {
        if (Math.abs(offset) >= length) {
            return format.format(Math.round(offset / length), unit);
        }
    }
    return format.format(0, "second");
}
