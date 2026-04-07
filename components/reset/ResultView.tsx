"use client";

import type { RTSnapshot } from "@/lib/types";
import { goalChips } from "@/data/prompts";

export default function ResultView({
  css,
  dss,
  goalChip,
  pre,
  post,
  onDone,
}: {
  css: number;
  dss: number;
  goalChip: string;
  pre: RTSnapshot;
  post: RTSnapshot;
  onDone: () => void;
}) {
  const selectedGoal = goalChips.find((c) => c.id === goalChip);

  // Hero copy by delta sign (3-way split)
  let heroLine: string;
  let heroSub: string;
  if (dss >= 1) {
    heroLine = `당신의 초점이 ${dss}% 더 또렷해졌어요`;
    heroSub = "작은 차이지만, 신경 시스템이 실제로 다르게 반응하고 있다는 뜻이에요";
  } else if (dss <= -1) {
    heroLine = "오늘은 회복이 더 필요해요";
    heroSub = "충분히 쉬는 것도 회복입니다";
  } else {
    heroLine = "평소와 비슷한 컨디션이에요";
    heroSub = "꾸준함이 가장 강한 신호예요";
  }

  // Pulse period: faster RT → faster pulse. Bounded for perceptibility.
  const pulsePeriod = (ms: number) =>
    `${Math.max(400, Math.min(1500, Math.round(ms * 2)))}ms`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-10 px-4 py-8">
      {/* Hero copy */}
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-text-faint">
          90초 결과
        </p>
        <h1 className="mt-3 animate-score-reveal font-serif text-3xl leading-snug text-amber">
          {heroLine}
        </h1>
        <p className="mt-2 text-sm text-text-dim">{heroSub}</p>
      </div>

      {/* Before / After comparison card */}
      <div className="w-full max-w-sm rounded-2xl border border-amber/20 bg-surface">
        <div className="grid grid-cols-2">
          {/* PRE */}
          <div className="flex flex-col items-center gap-4 px-4 py-6">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
              90초 전
            </p>
            <span
              className="block h-7 w-7 animate-pulse rounded-full bg-text-faint"
              style={{ animationDuration: pulsePeriod(pre.mean_ms) }}
              aria-hidden
            />
            <div className="text-center">
              <p className="font-mono text-2xl text-text-dim">
                {Math.round(pre.mean_ms)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                ms
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 h-16 w-px -translate-y-1/2 bg-amber/15" />

            {/* POST */}
            <div className="flex flex-col items-center gap-4 px-4 py-6">
              <p className="font-mono text-[10px] uppercase tracking-wider text-amber/80">
                지금
              </p>
              <span
                className="block h-7 w-7 animate-pulse rounded-full bg-amber"
                style={{ animationDuration: pulsePeriod(post.mean_ms) }}
                aria-hidden
              />
              <div className="text-center">
                <p className="font-mono text-2xl text-amber">
                  {Math.round(post.mean_ms)}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-faint">
                  ms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA — goal-aware */}
      <button
        onClick={onDone}
        className="rounded-2xl bg-amber px-10 py-4 text-lg font-medium text-background transition-shadow hover:shadow-[0_0_30px_var(--color-amber-glow)]"
      >
        {selectedGoal
          ? `${selectedGoal.icon} ${selectedGoal.label} 시작하기`
          : "완료하기"}
      </button>

      {/* Details disclosure — raw scores */}
      <details className="group w-full max-w-sm">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-1 text-xs text-text-faint transition-colors hover:text-text-dim">
          <span>측정 자세히 보기</span>
          <span className="transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-4 space-y-2 rounded-xl border border-amber/10 bg-surface-2 p-4 text-center font-mono text-xs text-text-dim">
          <div className="flex justify-between">
            <span className="text-text-faint">Cognitive Sprint Score</span>
            <span>{css}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-faint">Reset Lift</span>
            <span>
              {dss > 0 ? "+" : ""}
              {dss}%
            </span>
          </div>
        </div>
      </details>
    </div>
  );
}
