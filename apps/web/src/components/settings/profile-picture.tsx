import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@quilt/ui/components/avatar";
import { Button } from "@quilt/ui/components/button";
import { CameraIcon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { SectionCard } from "@/components/settings/section-card";
import { initials } from "@/lib/initials";
import { IMAGE_TYPES, imageProblem } from "@/lib/profile/image";
import { type Profile, useSetProfileImage } from "@/lib/profile/use-profile";

export function ProfilePicture({ profile }: { profile: Profile }) {
  const setImage = useSetProfileImage();
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const problemId = useId();
  const [problem, setProblem] = useState<string>();

  function onChoose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const found = imageProblem(file);
    setProblem(found);
    if (found) return;
    setImage(file);
    toast.success("Profile picture updated");
  }

  function onRemove() {
    setImage(null);
    setProblem(undefined);
    toast.success("Profile picture removed");
  }

  return (
    <SectionCard
      title="Profile picture"
      description="Shown next to your name across quilt. A PNG, JPEG or WebP image of up to 5 MB."
    >
      <div className="flex flex-wrap items-center gap-5">
        <label
          htmlFor={inputId}
          className="group relative cursor-pointer rounded-full"
        >
          <span className="sr-only">Choose a new profile picture</span>
          <Avatar className="size-20" aria-hidden="true">
            {profile.image && <AvatarImage src={profile.image} alt="" />}
            <AvatarFallback className="text-2xl">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <CameraIcon className="size-5" />
          </span>
        </label>
        <input
          ref={input}
          id={inputId}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          className="hidden"
          aria-describedby={problem ? problemId : undefined}
          onChange={onChoose}
        />
        <div className="flex flex-col gap-3">
          <dl className="grid gap-0.5 text-sm">
            <dt className="sr-only">Name</dt>
            <dd className="font-medium text-base">{profile.name}</dd>
            <dt className="sr-only">Email</dt>
            <dd className="text-muted-foreground">{profile.email}</dd>
          </dl>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => input.current?.click()}>
              <UploadIcon />
              Upload image
            </Button>
            {profile.image && (
              <Button variant="ghost" onClick={onRemove}>
                Remove
              </Button>
            )}
          </div>
          {problem && (
            <p id={problemId} role="alert" className="text-destructive text-sm">
              {problem}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
