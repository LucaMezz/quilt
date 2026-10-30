export function printJson(value: unknown) {
    console.log(JSON.stringify(value, null, 2));
}

export function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}
