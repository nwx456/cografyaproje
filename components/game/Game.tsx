"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimalIcon } from "./animals";
import {
  ANIMALS,
  ROUNDS,
  type AnimalId,
  formatFrequency,
  fleeingAnimalsAtHz,
} from "./data";
import { useTone } from "./useTone";
import { DevicePod } from "./DevicePod";

type Phase = "intro" | "round" | "feedback" | "end";

export function Game() {
  const { play, stop, ensureContext } = useTone();
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<Set<AnimalId>>(new Set());
  const [score, setScore] = useState(0);
  const [fledIds, setFledIds] = useState<Set<AnimalId>>(new Set());
  const [showFeedbackDetail, setShowFeedbackDetail] = useState(false);

  const round = ROUNDS[roundIndex];
  const correctSet = useMemo(
    () => new Set(round?.fleeingIds ?? []),
    [round],
  );

  useEffect(() => {
    if (phase !== "round" || !round) return;
    void play(round.frequencyHz);
    return () => stop();
  }, [phase, roundIndex, round, play, stop]);

  const resetRoundSelection = () => {
    setSelected(new Set());
    setFledIds(new Set());
    setShowFeedbackDetail(false);
  };

  const startGame = async () => {
    await ensureContext();
    setScore(0);
    setRoundIndex(0);
    resetRoundSelection();
    setPhase("round");
  };

  const toggleAnimal = (id: AnimalId) => {
    if (phase !== "round") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setsEqual = (a: Set<AnimalId>, b: Set<AnimalId>) => {
    if (a.size !== b.size) return false;
    for (const x of a) if (!b.has(x)) return false;
    return true;
  };

  const submitAnswer = () => {
    if (phase !== "round" || !round) return;
    stop();
    const isPerfect = setsEqual(selected, correctSet);
    if (isPerfect) setScore((s) => s + 1);
    setFledIds(new Set(correctSet));
    setShowFeedbackDetail(true);
    setPhase("feedback");
  };

  const nextStep = useCallback(() => {
    if (roundIndex >= ROUNDS.length - 1) {
      setPhase("end");
      stop();
      return;
    }
    setRoundIndex((i) => i + 1);
    resetRoundSelection();
    setPhase("round");
  }, [roundIndex, stop]);

  const freqLabel = round ? formatFrequency(round.frequencyHz) : "";

  return (
    <div className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-2xl flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
      <header className="mb-2 shrink-0 text-center">
        <h1 className="font-heading text-lg font-semibold tracking-tight text-[#ededed] sm:text-xl">
          Yangın frekans oyunu
        </h1>
        <p className="mt-0.5 text-xs text-[var(--text-muted)] sm:text-sm">
          Frekansa hangi hayvanların kaçacağını tahmin et.
        </p>
      </header>

      <div className="relative mb-2 shrink-0 overflow-visible rounded-xl border border-[var(--border-subtle)] bg-[var(--background-card)]">
        <div className="overflow-hidden rounded-t-xl">
          <FireScene active={phase === "round" || phase === "feedback"} />
        </div>
        <DevicePanel
          frequencyHz={round?.frequencyHz ?? 0}
          wavesActive={phase === "round" || phase === "feedback"}
          showFrequency={phase === "round" || phase === "feedback"}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-2"
          >
            <p className="max-w-md text-center text-xs text-[var(--text-muted)] sm:text-sm">
              Pod tek frekans yayar; hayvan yalnızca kendi korkutma aralığında
              kaçar.
            </p>
            <button
              type="button"
              onClick={() => void startGame()}
              className="rounded-lg bg-[var(--accent-fire)] px-6 py-2 text-sm font-medium text-white transition hover:brightness-110"
            >
              Başla
            </button>
          </motion.div>
        )}

        {(phase === "round" || phase === "feedback") && round && (
          <motion.div
            key={`round-${roundIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2 pb-2"
          >
            <div className="shrink-0 text-center">
              <p className="text-sm sm:text-base">
                Cihaz{" "}
                <span className="font-mono font-semibold text-[#ededed]">
                  {freqLabel}
                </span>{" "}
                veriyor. Hangi hayvanlar kaçar?
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Tur {roundIndex + 1} / {ROUNDS.length}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-5 gap-1.5 sm:gap-2">
              {ANIMALS.map((animal) => {
                const isSelected = selected.has(animal.id);
                const fled = fledIds.has(animal.id);
                const shouldFlee = correctSet.has(animal.id);
                const missed = showFeedbackDetail && shouldFlee && !isSelected;
                const wrong = showFeedbackDetail && isSelected && !shouldFlee;
                const choiceOk =
                  showFeedbackDetail && shouldFlee === isSelected;

                return (
                  <motion.button
                    key={animal.id}
                    type="button"
                    disabled={phase === "feedback"}
                    onClick={() => toggleAnimal(animal.id)}
                    animate={
                      fled
                        ? { x: 120, opacity: 0 }
                        : { x: 0, opacity: 1 }
                    }
                    transition={{ duration: 0.6, ease: "easeIn" }}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition ${
                      wrong
                        ? "border-white/25 opacity-50"
                        : missed
                          ? "border-white/40 border-dashed"
                          : isSelected
                            ? "border-white/70 bg-white/5"
                            : "border-white/10 bg-transparent hover:border-white/25"
                    } ${phase === "feedback" ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <AnimalIcon id={animal.id} className="h-8 w-8 sm:h-9 sm:w-9" />
                    <span className="text-[10px] font-medium leading-tight text-[#ededed] sm:text-xs">
                      {animal.name}
                    </span>
                    {choiceOk && (
                      <span className="text-[10px] font-medium text-[#ededed]">
                        Doğru
                      </span>
                    )}
                    {(wrong || missed) && (
                      <span className="text-[10px] font-medium text-[var(--text-muted)]">
                        Yanlış
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {showFeedbackDetail && (
              <p className="shrink-0 text-center text-xl font-semibold tracking-wide text-[#ededed]">
                {setsEqual(selected, correctSet) ? "Doğru" : "Yanlış"}
              </p>
            )}

            {phase === "round" && (
              <div className="flex shrink-0 justify-center pt-1">
                <button
                  type="button"
                  onClick={submitAnswer}
                  className="rounded-lg border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                  Cevapla
                </button>
              </div>
            )}

            {showFeedbackDetail && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--background-elevated)] p-3 text-xs sm:text-sm"
              >
                {!setsEqual(selected, correctSet) && (
                  <ul className="mb-2 space-y-1 text-[var(--text-muted)]">
                    {fleeingAnimalsAtHz(round.frequencyHz).map((a) => (
                      <li key={a.id}>
                        <span className="text-[#ededed]">{a.name}:</span>{" "}
                        {a.scareLabel}
                      </li>
                    ))}
                    {fleeingAnimalsAtHz(round.frequencyHz).length === 0 && (
                      <li>Bu frekansta hiçbir hayvan kaçmaz.</li>
                    )}
                  </ul>
                )}
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-lg bg-[var(--accent-fire)] px-5 py-2 text-sm text-white hover:brightness-110"
                  >
                    {roundIndex >= ROUNDS.length - 1 ? "Sonuçları gör" : "Sonraki tur"}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "end" && (
          <motion.div
            key="end"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-2 text-center"
          >
            <p className="text-xl font-semibold">
              Skor: {score} / {ROUNDS.length}
            </p>
            <p className="max-w-md text-[var(--text-muted)]">
              Her turda kaçması gereken tüm hayvanları doğru seçersen 1 puan
              alırsın.
            </p>
            <button
              type="button"
              onClick={() => void startGame()}
              className="rounded-xl bg-[var(--accent-fire)] px-8 py-3 font-medium text-white hover:brightness-110"
            >
              Yeniden oyna
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

function FireScene({ active }: { active: boolean }) {
  return (
    <div className="relative h-24 bg-gradient-to-t from-[#1a0a00] via-[#2a1208] to-[var(--background-card)] sm:h-28">
      {active && (
        <>
          <motion.div
            className="absolute bottom-0 left-[15%] h-24 w-16 rounded-full bg-[var(--accent-fire)] blur-xl opacity-70"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
          <motion.div
            className="absolute bottom-0 right-[20%] h-20 w-14 rounded-full bg-orange-500 blur-lg opacity-60"
            animate={{ scale: [1.1, 0.95, 1.1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          />
          <motion.div
            className="absolute bottom-2 left-1/2 h-28 w-20 -translate-x-1/2 rounded-full bg-[#ff6b00] blur-2xl opacity-50"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </>
      )}
      {!active && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-[var(--text-muted)]">
          Orman, yangın bekleniyor
        </p>
      )}
    </div>
  );
}

function DevicePanel({
  frequencyHz,
  wavesActive,
  showFrequency,
}: {
  frequencyHz: number;
  wavesActive: boolean;
  showFrequency: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center border-t border-[var(--border-subtle)] px-2 pb-3 pt-0">
      <div className="relative -mt-8 overflow-visible">
        <DevicePod wavesActive={wavesActive} />
      </div>

      {showFrequency && frequencyHz > 0 && (
        <span className="mt-0 font-mono text-xs text-[var(--text-muted)]">
          {formatFrequency(frequencyHz)}
        </span>
      )}
    </div>
  );
}
