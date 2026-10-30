import { z } from "zod";
import { InvalidImageError } from "#/lib/images";
import { protectedProcedure } from "#/procedures";
import {
    describeImageUpload,
    ImageFile,
    invalidImage,
} from "#/routers/shared/images";
import { setUserImage, USER_IMAGE_DIMENSION } from "#/services/user/users";

const UserSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullish(),
    createdAt: z.date(),
});

export const userRouter = {
    setImage: protectedProcedure
        .route({
            operationId: "setUserImage",
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
                    context.caller.userId,
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
