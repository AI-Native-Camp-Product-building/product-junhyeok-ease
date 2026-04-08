/**
 * 목표 프라이밍 칩 옵션
 * 칩은 "지금부터 5분 안에 실제로 할 수 있는 구체 행동"이어야 한다.
 * 추상적 의도("집중하기")는 결과 CTA "{goal} 시작하기"와 결합될 때
 * 어색해지므로 금지. id는 localStorage 호환을 위해 유지한다.
 */
export const goalChips = [
  { id: "focus", label: "한 가지에 집중", icon: "🎯" },
  { id: "learn", label: "한 페이지 읽기", icon: "📖" },
  { id: "create", label: "한 줄 메모", icon: "📝" },
  { id: "exercise", label: "5분 산책", icon: "🚶" },
  { id: "connect", label: "안부 한 마디", icon: "💬" },
  { id: "rest", label: "물 한 잔", icon: "💧" },
] as const;

/** 호흡 가이드 설정 */
export const breathingPattern = {
  inhale_sec: 4,
  hold_sec: 0,
  exhale_sec: 4,
  cycles: 3, // 24초 (20초 Phase에 근접)
} as const;

/** 결과 화면 메시지 */
export const resultMessages = {
  excellent: "뛰어난 집중력이에요! 도파민 시스템이 잘 반응하고 있습니다.",
  good: "좋은 상태예요. 오늘의 리셋이 효과적이었습니다.",
  neutral: "평균적인 상태입니다. 꾸준한 리셋이 도움이 됩니다.",
  low: "오늘은 좀 둔한 날이네요. 괜찮아요, 내일 다시 해봐요.",
} as const;

/** 카운트다운 텍스트 */
export const countdownSequence = ["숨을 들이쉬고", "내쉬고", "Go"] as const;
