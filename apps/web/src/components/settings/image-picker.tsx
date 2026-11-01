import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@quilt/ui/components/avatar";
import { Button } from "@quilt/ui/components/button";
import { cn } from "@quilt/ui/lib/utils";
import { CameraIcon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import { IMAGE_TYPES, imageProblem } from "@/lib/images";

const SHAPES = {
  circle: {
    rounded: "rounded-full",
    avatar: "rounded-full after:rounded-full",
  },
  square: { rounded: "rounded-xl", avatar: "rounded-xl after:rounded-xl" },
};

export function ImagePicker({
  image,
  fallback,
  label,
  shape = "circle",
  onChange,
  children,
}: {
  image: string | null;
  fallback: string;
  label: string;
  shape?: "circle" | "square";
  onChange: (file: File | null) => void;
  children?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const problemId = useId();
  const [problem, setProblem] = useState<string>();
  const { rounded, avatar } = SHAPES[shape];

  function onChoose(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const found = imageProblem(file);
    setProblem(found);
    if (!found) onChange(file);
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <label
        htmlFor={inputId}
        className={cn("group relative cursor-pointer", rounded)}
      >
        <span className="sr-only">Choose a new {label}</span>
        <Avatar className={cn("size-20", avatar)} aria-hidden="true">
          {image && <AvatarImage src={image} alt="" className={rounded} />}
          <AvatarFallback className={cn("text-2xl", rounded)}>
            {fallback}
          </AvatarFallback>
        </Avatar>
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100",
            rounded,
          )}
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
        {children}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => input.current?.click()}>
            <UploadIcon />
            Upload image
          </Button>
          {image && (
            <Button
              variant="ghost"
              onClick={() => {
                setProblem(undefined);
                onChange(null);
              }}
            >
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
  );
}
