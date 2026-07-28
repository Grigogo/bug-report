import type { Tag } from "@prisma/client";
import { tagColor } from "@/lib/tags";

export function TagChip({ tag, small }: { tag: Tag; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${tagColor(tag.color).chip} ${
        small ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tagColor(tag.color).dot}`} />
      {tag.name}
    </span>
  );
}
