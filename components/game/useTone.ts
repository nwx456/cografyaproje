"use client";

import { useCallback, useRef } from "react";

function volumeForHz(hz: number): number {
  if (hz < 150) return 0.35;
  if (hz > 4000) return 0.12;
  if (hz > 3000) return 0.18;
  return 0.22;
}

export function useTone() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const stop = useCallback(() => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
      } catch {
        /* already stopped */
      }
      oscRef.current.disconnect();
      oscRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (hz: number) => {
      stop();
      const ctx = await ensureContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;
      gain.gain.value = volumeForHz(hz);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
    },
    [ensureContext, stop],
  );

  return { play, stop, ensureContext };
}
