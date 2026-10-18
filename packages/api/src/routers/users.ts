import { z } from "zod";

import { protectedProcedure } from "../index";
import { InvalidImageError } from "../services/images";
import { setUserImage, USER_IMAGE_DIMENSION } from "../services/users";
import { describeImageUpload, ImageFile, invalidImage } from "./images";

export const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullish(),
    createdAt: z.date(),
});

export const usersRouter = {
    setUserImage: protectedProcedure
        .route({
            method: "PUT",
            path: "/user/image",
            summary: "Set profile picture",
            description: `Replaces your profile picture. ${describeImageUpload(USER_IMAGE_DIMENSION)}`,
            successDescription: "Profile picture updated",
            tags: ["Users"],
        })
        .errors({ BAD_REQUEST: invalidImage })
        .input(z.object({ image: ImageFile }))
        .output(UserSchema)
        .handler(async ({ input, context, errors }) => {
            try {
                return await setUserImage(
                    context.db,
                    context.auth,
                    context.storage,
                    context.headers,
                    context.session.user.id,
                    input.image,
                );
            } catch (error) {
                if (error instanceof InvalidImageError) {
                    throw errors.BAD_REQUEST();
                }
                throw error;
            }
        }),
};
