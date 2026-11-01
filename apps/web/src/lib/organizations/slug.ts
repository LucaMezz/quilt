export const MAX_NAME = 64;
export const MAX_SLUG = 40;

const RESERVED = new Set(["invitations", "new"]);

export function slugify(name: string) {
    return name
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+/, "")
        .slice(0, MAX_SLUG)
        .replace(/-+$/, "");
}

export function slugProblem(slug: string) {
    if (slug.length === 0) return "Enter a URL name";
    if (slug.length < 2) return "Use at least 2 characters";
    if (slug.length > MAX_SLUG) return `Use ${MAX_SLUG} characters or fewer`;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        return "Use lowercase letters, numbers and single dashes between them";
    }
    if (RESERVED.has(slug)) return "That URL name is reserved by quilt";
    return undefined;
}
