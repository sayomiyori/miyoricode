"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Tilt from "react-parallax-tilt";
import { hasFinePointer } from "@/lib/pointer";

export function AvatarTilt() {
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [src, setSrc] = useState("/hero-avatar.png");

  useEffect(() => {
    setTiltEnabled(hasFinePointer());
  }, []);

  return (
    <Tilt
      tiltEnable={tiltEnabled}
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
      scale={1.03}
      glareEnable={false}
      transitionSpeed={400}
      className="mx-auto w-[min(100%,280px)]"
    >
      <div className="relative aspect-square">
        <Image
          src={src}
          alt="Matvey"
          width={1280}
          height={1280}
          quality={95}
          sizes="640px"
          priority
          className="h-full w-full object-contain drop-shadow-[0_16px_28px_rgb(26_29_35_/_0.22)]"
          onError={() => setSrc("/avatar.svg")}
        />
      </div>
    </Tilt>
  );
}
