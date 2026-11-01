import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const user = { name: "Ada Lovelace", email: "ada@example.com", image: null };

const createObjectURL = vi.fn<(file: Blob) => string>();
const revokeObjectURL = vi.fn<(url: string) => void>();

async function freshStore() {
    vi.resetModules();
    return import("./use-profile");
}

beforeEach(() => {
    let count = 0;
    createObjectURL.mockImplementation(() => `blob:picture-${++count}`);
    vi.stubGlobal(
        "URL",
        Object.assign(URL, { createObjectURL, revokeObjectURL }),
    );
});

afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
});

describe("profile store", () => {
    it("starts from the signed-in user", async () => {
        const { useProfile } = await freshStore();

        const { result } = renderHook(() => useProfile(user));

        expect(result.current).toEqual(user);
    });

    it("shows a new name in every view", async () => {
        const { useProfile, useUpdateProfileName } = await freshStore();
        const { result: page } = renderHook(() => ({
            profile: useProfile(user),
            rename: useUpdateProfileName(),
        }));
        const { result: sidebar } = renderHook(() => useProfile(user));

        act(() => page.current.rename("Ada King"));

        expect(page.current.profile.name).toBe("Ada King");
        expect(sidebar.current.name).toBe("Ada King");
    });

    it("previews a chosen picture and frees the one it replaces", async () => {
        const { useProfile, useSetProfileImage } = await freshStore();
        const { result } = renderHook(() => ({
            profile: useProfile(user),
            setImage: useSetProfileImage(),
        }));
        const picture = new File(["a"], "a.png", { type: "image/png" });

        act(() => result.current.setImage(picture));
        expect(createObjectURL).toHaveBeenCalledWith(picture);
        expect(result.current.profile.image).toBe("blob:picture-1");

        act(() => result.current.setImage(picture));
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:picture-1");
        expect(result.current.profile.image).toBe("blob:picture-2");
    });

    it("removes the picture, including one from the session", async () => {
        const { useProfile, useSetProfileImage } = await freshStore();
        const withImage = { ...user, image: "https://quilt.test/ada.webp" };
        const { result } = renderHook(() => ({
            profile: useProfile(withImage),
            setImage: useSetProfileImage(),
        }));

        act(() => result.current.setImage(null));

        expect(result.current.profile.image).toBeNull();
        expect(revokeObjectURL).not.toHaveBeenCalled();
    });
});
