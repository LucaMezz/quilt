export const EXPIRATIONS = [
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
    { value: 90, label: "90 days" },
    { value: 365, label: "1 year" },
];

const DAY = 24 * 60 * 60 * 1000;

export function expiryDate(days: number) {
    return new Date(Date.now() + days * DAY).toLocaleDateString(undefined, {
        dateStyle: "long",
    });
}
