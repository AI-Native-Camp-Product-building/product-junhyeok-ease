"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ResetStep, RTSnapshot, Session } from "@/lib/types";
import { calculateCSS, calculateDSS, sprintBaseline, resultHero } from "@/lib/score";
import { useAppState } from "@/lib/state-context";
import { today } from "@/lib/state";
import { countdownSequence } from "@/data/prompts";
import { ProgressBar } from "@/components/ui";
import ReactionTime from "@/components/reset/ReactionTime";
import NBackGame from "@/components/reset/NBackGame";
import BreathingGuide from "@/components/reset/BreathingGuide";
import GoalChip from "@/components/reset/GoalChip";
import ResultView from "@/components/reset/ResultView";

const STEPS: { key: ResetStep; label: string }[] = [
  { key: "countdown", label: "준비" },
  { key: "pre_rt", label: "PRE" },
  { key: "sprint", label: "스프린트" },
  { key: "breathe", label: "리셋" },
  { key: "goal", label: "목표" },
  { key: "post_rt", label: "POST" },
  { key: "result", label: "결과" },
];

export default function ResetPage() {
  const { state, recordSession } = useAppState();
  const [step, setStep] = useState<ResetStep>("idle");
  const [preData, setPreData] = useState<RTSnapshot | null>(null);
  const [postData, setPostData] = useState<RTSnapshot | null>(null);
  const [sprintScore, setSprintScore] = useState(0);
  const [goalChip, setGoalChip] = useState("");
  const [countdownIdx, setCountdownIdx] = useState(0);

  // Progress calculation
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const progress = step === "idle" ? 0 : step === "result" ? 100 : Math.round(((stepIndex + 1) / STEPS.length) * 100);

  // Countdown auto-advance
  useEffect(() => {
    if (step !== "countdown") return;
    if (countdownIdx >= countdownSequence.length) {
      setStep("pre_rt");
      return;
    }
    const t = setTimeout(() => setCountdownIdx((i) => i + 1), 700);
    return () => clearTimeout(t);
  }, [step, countdownIdx]);

  // === IDLE ===
  if (step === "idle") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="font-serif text-4xl text-teal">Brain Reset</h1>
        <p className="mt-3 text-center text-text-dim">
          90초 동안 도파민 민감도를 측정하고 회복합니다
        </p>

        <div className="mt-8 flex gap-1">
          {STEPS.map((s) => (
            <div key={s.key} className="flex flex-col items-center gap-1">
              <div className="h-2 w-8 rounded-full bg-surface-2" />
              <span className="text-[10px] text-text-faint">{s.label}</span>
            </div>
          ))}
        </div>

        <button
          className="mt-10 animate-pulse-glow rounded-2xl bg-teal px-10 py-4 text-lg font-medium text-background transition-shadow"
          onClick={() => {
            setCountdownIdx(0);
            setStep("countdown");
          }}
        >
          시작하기
        </button>

        <Link href="/" className="mt-6 text-sm text-text-dim hover:text-teal">
          ← 대시보드로 돌아가기
        </Link>
      </main>
    );
  }

  // === ACTIVE SESSION ===
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      {step !== "result" && (
        <div className="px-4 pt-4">
          <ProgressBar
            value={progress}
            color={step === "breathe" || step === "goal" || step === "post_rt" ? "amber" : "teal"}
          />
          <div className="mt-2 flex justify-between">
            {STEPS.map((s, i) => (
              <span
                key={s.key}
                className={`text-[10px] ${
                  i <= stepIndex ? "text-text-dim" : "text-text-faint"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1">
        {/* COUNTDOWN */}
        {step === "countdown" && (
          <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
            <p className="font-serif text-3xl text-teal">
              {countdownSequence[countdownIdx] ?? ""}
            </p>
          </div>
        )}

        {/* PRE RT */}
        {step === "pre_rt" && (
          <div>
            <p className="px-4 pt-6 text-center font-mono text-xs uppercase tracking-wider text-teal">
              PRE 측정
            </p>
            <ReactionTime
              onComplete={(snapshot) => {
                setPreData(snapshot);
                setStep("sprint");
              }}
            />
          </div>
        )}

        {/* SPRINT (N-Back) */}
        {step === "sprint" && (
          <div>
            <p className="px-4 pt-6 text-center font-mono text-xs uppercase tracking-wider text-teal">
              인지 스프린트
            </p>
            <NBackGame
              duration={25}
              onComplete={(accuracy) => {
                setSprintScore(accuracy);
                setStep("breathe");
              }}
            />
          </div>
        )}

        {/* BREATHE */}
        {step === "breathe" && (
          <div>
            <p className="px-4 pt-6 text-center font-mono text-xs uppercase tracking-wider text-amber">
              뉴로 리셋
            </p>
            <BreathingGuide onComplete={() => setStep("goal")} />
          </div>
        )}

        {/* GOAL */}
        {step === "goal" && (
          <div>
            <GoalChip
              onSelect={(chipId) => {
                setGoalChip(chipId);
                setStep("post_rt");
              }}
            />
          </div>
        )}

        {/* POST RT */}
        {step === "post_rt" && (
          <div>
            <p className="px-4 pt-6 text-center font-mono text-xs uppercase tracking-wider text-amber">
              POST 측정
            </p>
            <ReactionTime
              onComplete={(snapshot) => {
                setPostData(snapshot);
                setStep("result");
              }}
            />
          </div>
        )}

        {/* RESULT */}
        {step === "result" && preData && postData && (() => {
          const css = calculateCSS(sprintScore, sprintBaseline(state.sessions));
          const dss = calculateDSS(preData, postData);
          const hero = resultHero(
            { dss, goal_chip: goalChip, pre: preData, post: postData },
            state.sessions
          );
          return (
            <ResultView
              css={css}
              dss={dss}
              goalChip={goalChip}
              pre={preData}
              post={postData}
              heroLine={hero.line}
              heroSub={hero.sub}
              onDone={() => {
                const session: Session = {
                  id: crypto.randomUUID(),
                  date: today(),
                  timestamp: Date.now(),
                  pre: preData,
                  post: postData,
                  sprint_score: sprintScore,
                  css,
                  dss,
                  goal_chip: goalChip,
                };
                recordSession(session);
                setStep("idle");
                setPreData(null);
                setPostData(null);
                setSprintScore(0);
                setGoalChip("");
              }}
            />
          );
        })()}
      </div>
    </main>
  );
}
