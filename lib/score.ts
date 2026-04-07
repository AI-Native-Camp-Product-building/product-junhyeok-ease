import type { RTSnapshot, Session, ScoreTier } from "./types";

/**
 * CSS (Cognitive Sprint Score)
 * N-Back 정답률을 z-score 정규화하여 0-100 스케일로 변환
 */
export function calculateCSS(
  accuracy: number,
  baseline: { mean: number; std: number }
): number {
  if (baseline.std === 0) return 50;
  const z = (accuracy - baseline.mean) / baseline.std;
  return Math.round(Math.max(0, Math.min(100, 50 + 10 * z)));
}

/**
 * DSS (Dopamine Sensitivity Score)
 * PRE/POST 반응속도 비교 — Reset Lift %
 * 양수 = POST가 PRE보다 빠름 (민감도 개선)
 */
export function calculateDSS(pre: RTSnapshot, post: RTSnapshot): number {
  if (pre.median_ms === 0) return 0;
  const lift = ((pre.median_ms - post.median_ms) / pre.median_ms) * 100;
  return Math.round(lift * 10) / 10;
}

/**
 * Shadow Baseline
 * 최근 7일 세션의 CSS 평균
 */
export function shadowBaseline(sessions: Session[]): number {
  const recent = sessions
    .filter((s) => {
      const age = Date.now() - s.timestamp;
      return age < 7 * 24 * 60 * 60 * 1000;
    })
    .map((s) => s.css);

  if (recent.length === 0) return 50; // 기본값
  return Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
}

/**
 * Sprint Baseline
 * 최근 7일 세션의 N-Back 정답률(sprint_score) 평균/표준편차.
 * CSS의 z-score 정규화에 사용되는 개인화 baseline.
 *
 * 표본이 3개 미만이면 콜드스타트 기본값 {mean: 70, std: 15}를 반환한다.
 * std 하한 5는 단일 이상치로 인한 z-score 폭주를 방지한다.
 */
export function sprintBaseline(sessions: Session[]): { mean: number; std: number } {
  const recent = sessions
    .filter((s) => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000)
    .map((s) => s.sprint_score);

  if (recent.length < 3) return { mean: 70, std: 15 };

  const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance =
    recent.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (recent.length - 1);
  const std = Math.max(5, Math.sqrt(variance));
  return { mean, std };
}

/** 점수 등급 판정 */
export function scoreTier(css: number): ScoreTier {
  if (css >= 70) return "excellent";
  if (css >= 55) return "good";
  if (css >= 40) return "neutral";
  return "low";
}

/** RT snapshot에서 median 계산 */
export function medianRT(trials: number[]): number {
  if (trials.length === 0) return 0;
  const sorted = [...trials].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
