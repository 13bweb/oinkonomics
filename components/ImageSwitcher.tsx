"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  images: string[];
  intervalMs?: number;
  className?: string;
};

export default function ImageSwitcher({ images, intervalMs = 3000, className = "" }: Props) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = setInterval(() => {
      setI((p) => (p + 1) % safeImages.length);
    }, Math.max(1200, intervalMs));
    return () => clearInterval(id);
  }, [safeImages.length, intervalMs]);

  if (safeImages.length === 0) return null;

  return (
    <div className={"relative w-full h-full overflow-hidden " + className}>
      {safeImages.map((src, idx) => (
        <img
          key={src + idx}
          src={src}
          alt="carousel"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
          draggable={false}
        />
      ))}
    </div>
  );
}
