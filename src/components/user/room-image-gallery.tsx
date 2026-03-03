"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

type ImageData = {
  id: string;
  url: string;
  alt?: string | null;
  name?: string | null;
  description?: string | null;
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

  const current = images[selected];

  return (
    <div className="space-y-3">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted relative">
        <img
          src={current.url}
          alt={current.name || current.alt || name}
          className="h-full w-full object-cover"
        />
        {(current.name || current.description) && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
            {current.name && <p className="font-medium">{current.name}</p>}
            {current.description && (
              <p className="text-sm opacity-90 mt-0.5">{current.description}</p>
            )}
          </div>
        )}
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
