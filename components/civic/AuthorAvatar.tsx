"use client";

import { initials } from "@/lib/civic-utils";
import { cn } from "@/lib/cn";

type AuthorAvatarProps = {
  name: string;
  color: string;
  image?: string | null;
  className?: string;
  /** sm ≈ 18px, md ≈ 20px */
  size?: "sm" | "md";
};

export function AuthorAvatar({
  name,
  color,
  image,
  className,
  size = "sm",
}: AuthorAvatarProps) {
  const dim =
    size === "md"
      ? "size-5 text-[9px] ring-2"
      : "size-[18px] text-[8px] ring-2";
  const trimmed = typeof image === "string" ? image.trim() : "";
  if (trimmed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- OAuth / user avatars
      <img
        src={trimmed}
        alt=''
        className={cn(
          dim,
          "shrink-0 rounded-full object-cover ring-paper/15",
          className,
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-paper/15",
        className,
      )}
      style={{ background: color }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
