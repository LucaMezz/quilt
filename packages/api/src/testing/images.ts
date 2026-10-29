export function notAnImage() {
    return new File([new TextEncoder().encode("not an image")], "logo.png", {
        type: "image/png",
    });
}
