"use client";

import { motion } from "framer-motion";
import devicePod from "./device-pod-transparent.png";
import { SoundWaves } from "./SoundWaves";

type Props = {
  wavesActive: boolean;
};

export function DevicePod({ wavesActive }: Props) {
  return (
    <div className="relative flex h-36 w-36 items-center justify-center overflow-visible sm:h-40 sm:w-40">
      <SoundWaves active={wavesActive} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-center"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={devicePod.src}
          width={devicePod.width}
          height={devicePod.height}
          alt="Akustik pod cihazı"
          className="h-28 w-auto object-contain drop-shadow-[0_6px_20px_rgba(255,255,255,0.12)] sm:h-32"
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
