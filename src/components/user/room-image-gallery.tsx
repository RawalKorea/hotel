"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

type ImageData = {
  id: string;
  url: string;
  alt: string | null;
};

export function RoomImageGallery({
  images,
  name,
}: {
  images: ImageData[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-muted flex items-center justify-center">
        <MapPin className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
        <img
          src={images[selected].url}
          alt={images[selected].alt || name}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelected(i)}
              className={cn(
                "flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden ring-2 ring-offset-2 transition-all",
                i === selected
                  ? "ring-primary"
                  : "ring-transparent hover:ring-muted-foreground/30"
              )}
            >
              <img
                src={img.url}
                alt={img.alt || `${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
