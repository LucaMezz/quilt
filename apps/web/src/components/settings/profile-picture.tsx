import { toast } from "sonner";

import { ImagePicker } from "@/components/settings/image-picker";
import { SectionCard } from "@/components/settings/section-card";
import { initials } from "@/lib/initials";
import { type Profile, useSetProfileImage } from "@/lib/profile/use-profile";

export function ProfilePicture({ profile }: { profile: Profile }) {
  const setImage = useSetProfileImage();

  return (
    <SectionCard
      title="Profile picture"
      description="Shown next to your name across quilt. A PNG, JPEG or WebP image of up to 5 MB."
    >
      <ImagePicker
        image={profile.image}
        fallback={initials(profile.name)}
        label="profile picture"
        onChange={(file) => {
          setImage(file);
          toast.success(
            file ? "Profile picture updated" : "Profile picture removed",
          );
        }}
      >
        <dl className="grid gap-0.5 text-sm">
          <dt className="sr-only">Name</dt>
          <dd className="font-medium text-base">{profile.name}</dd>
          <dt className="sr-only">Email</dt>
          <dd className="text-muted-foreground">{profile.email}</dd>
        </dl>
      </ImagePicker>
    </SectionCard>
  );
}
