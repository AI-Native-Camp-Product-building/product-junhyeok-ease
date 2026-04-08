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

// ───── Result hero messaging ─────

type HeroCtx = {
  dss: number;
  goal_chip: string;
  pre: RTSnapshot;
  post: RTSnapshot;
};

export type Hero = { line: string; sub: string };

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const TIME_BUCKET_LABELS: Record<string, string> = {
  morning: "아침",
  afternoon: "오후",
  evening: "저녁",
  night: "밤",
};
const ORDINAL_KR = ["", "첫", "두", "세", "네", "다섯", "여섯"] as const;

function timeBucket(d: Date): "morning" | "afternoon" | "evening" | "night" {
  const h = d.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function streakDays(history: Session[], today: Date): number {
  if (history.length === 0) return 0;
  const dayKeys = new Set(
    history.map((s) => new Date(s.timestamp).toDateString())
  );
  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);
  while (dayKeys.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * 결과 화면 hero 메시지 생성.
 * - `line`: dss 부호 기반 3-way (기계적, 예측 가능)
 * - `sub`: 11개 우선순위 룰 체인 (맥락 기반, 재방문 사용자에게 변화감)
 *
 * Pure function. `now`를 인자로 받아 결정적이고 테스트 가능.
 * 직전 룰 기억용 state 없음 — 같은 컨텍스트에 같은 문장이 나오는 것은
 * "유효 신호"로 수용한다. (사용자의 루틴이 같으면 문장도 같다)
 */
export function resultHero(
  ctx: HeroCtx,
  history: Session[],
  now: Date = new Date()
): Hero {
  const { dss } = ctx;

  // Line: 기계적 3-way
  let line: string;
  if (dss >= 1) {
    line = `당신의 초점이 ${dss}% 더 또렷해졌어요`;
  } else if (dss <= -1) {
    line = "오늘은 회복이 더 필요해요";
  } else {
    line = "평소와 비슷한 컨디션이에요";
  }

  return { line, sub: pickHeroSub(ctx, history, now) };
}

function pickHeroSub(
  ctx: HeroCtx,
  history: Session[],
  now: Date
): string {
  const { dss, goal_chip, pre, post } = ctx;

  // 1. 첫 세션
  if (history.length === 0) {
    return "첫 리셋이에요. 앞으로 당신만의 리듬이 쌓일 거예요";
  }

  // 2. 3일+ 연속 streak + 회복 유지
  const streak = streakDays(history, now);
  if (streak >= 3 && dss >= 0) {
    return `${streak}일 연속 리셋 중이에요. 루틴이 되고 있어요`;
  }

  // 3. 역대 최고 POST 반응속도
  const prevPostMedians = history
    .map((s) => s.post.median_ms)
    .filter((x) => x > 0);
  if (
    prevPostMedians.length >= 3 &&
    post.median_ms > 0 &&
    post.median_ms < Math.min(...prevPostMedians)
  ) {
    return "오늘의 반응속도, 역대 가장 빨랐어요";
  }

  // 4. 3연속 lift
  if (dss > 0 && history.length >= 2) {
    const last2 = history.slice(-2);
    if (last2.every((s) => s.dss > 0)) {
      return "3번 연속 초점이 더 또렷해지고 있어요";
    }
  }

  // 5. 같은 요일 패턴
  const wd = now.getDay();
  const sameWd = history.filter(
    (s) => new Date(s.timestamp).getDay() === wd
  );
  if (sameWd.length >= 3 && dss >= 0) {
    return `${WEEKDAY_LABELS[wd]}요일에 자주 리셋하셨네요`;
  }

  // 6. 같은 시간대 패턴
  const tb = timeBucket(now);
  const sameTb = history.filter(
    (s) => timeBucket(new Date(s.timestamp)) === tb
  );
  if (sameTb.length >= 3) {
    return `${TIME_BUCKET_LABELS[tb]}에 자주 리셋하시네요`;
  }

  // 7. 피곤한 상태로 시작 (PRE 중간값 > 400ms)
  if (pre.median_ms > 400) {
    return "오늘은 피곤한 상태로 시작했어요. 그럼에도 왔다는 게 중요해요";
  }

  // 8. Bounce back (직전 세션은 음수, 오늘은 양수)
  if (
    dss > 0 &&
    history.length >= 1 &&
    history[history.length - 1].dss < 0
  ) {
    return "직전엔 느렸는데 오늘은 또렷해졌어요";
  }

  // 9. 오늘 두 번째+ 세션
  const todayKey = now.toDateString();
  const todaySessions = history.filter(
    (s) => new Date(s.timestamp).toDateString() === todayKey
  );
  if (todaySessions.length >= 1) {
    const n = todaySessions.length + 1;
    const ord = ORDINAL_KR[n] ?? `${n}`;
    return `오늘 ${ord} 번째 리셋이에요. 깊게 가고 있네요`;
  }

  // 10. 최근 3세션 모두 같은 goal_chip
  if (goal_chip && history.length >= 3) {
    const last3 = history.slice(-3);
    if (last3.every((s) => s.goal_chip === goal_chip)) {
      return "자주 선택하는 목표네요. 당신의 우선순위가 보여요";
    }
  }

  // 11. 이번 주 누적
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const thisWeek = history.filter((s) => s.timestamp >= weekStart.getTime());
  if (thisWeek.length >= 1) {
    return `이번 주 ${thisWeek.length + 1}번째 리셋이에요`;
  }

  // Fallback — dss 부호별 정적 카피 (P0 원본)
  if (dss >= 1) {
    return "작은 차이지만, 신경 시스템이 실제로 다르게 반응하고 있다는 뜻이에요";
  }
  if (dss <= -1) return "충분히 쉬는 것도 회복입니다";
  return "꾸준함이 가장 강한 신호예요";
}
