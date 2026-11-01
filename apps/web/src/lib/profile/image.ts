export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const MAX_IMAGE_MB = 5;

export function imageProblem(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) {
        return "Choose a PNG, JPEG or WebP image.";
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        return `Choose an image of ${MAX_IMAGE_MB} MB or less.`;
    }
    return undefined;
}
