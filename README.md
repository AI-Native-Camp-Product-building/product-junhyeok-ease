# Ease

> **90초로 뇌를 리셋한다.** 도파민 과잉 시대를 위한 신경과학 기반 인지 회복 웹앱.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com)

---

스마트폰 중독, 숏폼 과소비, 끊임없는 알림 — 현대인의 도파민 시스템은 만성적으로 둔감해지고 있습니다. **Ease**는 신경과학 연구에 기반한 90초 Brain Reset 루프로 도파민 민감도를 **측정하고 회복**시키는 웹 서비스입니다. (한국어 브랜드명: **DOPA / 도파**)

## ✦ 90초 Brain Reset

```
 PRE         Sprint        Breathe       Goal         POST       Result
 ───┐        ───┐          ───┐         ───┐         ───┐        ───┐
 10s │ ─ ─ ▶ 25s │ ─ ─ ─ ▶ 20s │ ─ ─ ▶ 15s │ ─ ─ ▶ 10s │ ─ ─ ▶ ~10s
 RT  │       1-Back        호흡          프라이밍      RT          DSS
                            총 90초
```

하루 한 번, 90초. 객관적 지표로 오늘의 뇌 상태를 확인하고 도파민 민감도 변화를 7일 단위로 추적합니다.

## ✦ 핵심 기능

| 기능 | 설명 |
|---|---|
| **PRE/POST 반응속도 비교** | 단순반응시간(SRT)으로 즉각적 인지 회복량을 정량화 |
| **인지 스프린트 (1-Back)** | 작업기억 과제로 전전두엽 D1 수용체 활성화 |
| **호흡 가이드 리셋** | DMN→TPN 네트워크 전환을 유도하는 구조화된 휴식 |
| **목표 프라이밍** | 회복된 도파민 민감도를 행동 의도와 결합 |
| **DSS 점수** | Reset Lift % — PRE 대비 POST 개선치 (양수=회복) |
| **CSS 점수** | 인지 스프린트 z-score 정규화 (0–100) |
| **Shadow Baseline** | 7일 rolling 평균으로 추세 시각화 |
| **일일 스트릭** | 미완료 세션은 기록 제외, ADHD-friendly 무패널티 |

## ✦ 시작하기

**요구사항**: Node.js 18.18+ (Next.js 16 권장: Node 20 LTS)

```bash
git clone https://github.com/AI-Native-Camp-Product-building/product-junhyeok-ease.git
cd product-junhyeok-ease
npm install
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속합니다.

### 명령어

| 명령 | 용도 |
|---|---|
| `npm run dev` | Turbopack 개발 서버 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 (타입 검증 포함) |
| `npm run start` | 프로덕션 서버 |
| `npm run lint` | ESLint (현재 config 이슈로 미동작 — 추후 수정 예정) |

> 별도 테스트 러너 미설정. **`npm run build` 성공 여부로 타입 안정성을 검증**합니다.

## ✦ 기술 스택

- **Next.js 16** — App Router, Turbopack
- **React 19** + **TypeScript strict**
- **Tailwind CSS v4** — `@theme inline` 토큰 시스템
- **localStorage** — 클라이언트 전용 상태 (점수·스트릭·세션)
- **Vercel** 배포

> 백엔드/DB 없음. 모든 측정 데이터는 사용자의 브라우저에만 저장되며 외부로 전송되지 않습니다.

## ✦ 디자인 시스템

OLED Dark 기반, **세션 단계별 톤 전환**으로 인지 상태를 유도합니다.

| 토큰 | HEX | 역할 |
|---|---|---|
| `bg` | `#12110F` | OLED 최적화 배경 |
| `surface` | `#1A1D23` | 카드·패널 |
| `teal` | `#4A9B8E` | **Phase A** 인지 도전 — 차갑고 집중적 |
| `amber` | `#C4956A` | **Result** 보상 — 따뜻하고 유기적 |
| `positive` | `#5B9A6F` | 개선 표시 |
| `negative` | `#B85C5C` | 하락 표시 (최소 사용) |
| `text` | `#E8E6E3` | 본문 |
| `text-dim` | `#9B9A97` | 보조 텍스트 |

**규칙**: raw Tailwind 색상 금지. 반드시 디자인 토큰 또는 CSS 변수 사용.

## ✦ 프로젝트 구조

```
ease/
├── app/                       # Next.js App Router
│   ├── layout.tsx              # 다크 테마, 폰트, 메타
│   ├── page.tsx                # 대시보드 (점수·스트릭·CTA)
│   ├── reset/page.tsx          # 90초 Brain Reset FSM
│   ├── history/page.tsx        # 과거 세션 목록
│   └── globals.css             # 디자인 토큰 + 애니메이션
├── components/
│   ├── ui/                     # Card, Button, ProgressBar, Badge
│   ├── reset/                  # NBackGame, BreathingGuide, ReactionTime, GoalChip
│   └── dashboard/              # ScoreCard, Sparkline, StreakCounter
├── lib/
│   ├── types.ts                # Session, Score, ResetStep
│   ├── score.ts                # CSS·DSS·Shadow Baseline 계산
│   ├── state.ts                # localStorage CRUD
│   ├── state-context.tsx       # React Context + useAppState()
│   └── streak.ts               # 스트릭 계산
├── data/
│   └── prompts.ts              # 목표 칩, 호흡 패턴
└── research/                  # 과학적 근거 (4개 문서, 아래 참조)
```

## ✦ 과학적 근거

Ease의 90초 루프는 "느낌"이 아니라 **측정 가능한 신경과학적 메커니즘**에 기반합니다.

### 단계별 메커니즘

- **PRE/POST SRT** — 단순반응시간은 도파민계 각성 수준의 표준 행동 프록시. 수동적 미디어 소비 후 둔화된 SRT가 과제 수행 후 개선되는 정도(**Reset Lift**)가 도파민 민감도 회복의 지표.
- **1-Back 작업기억** — 전전두엽 D1 수용체를 활성화하고 DMN(디폴트 모드 네트워크) → TPN(과제 양성 네트워크) 전환을 유발. "멍때리기"에서 "집중"으로의 회로 스위치.
- **호흡 가이드** — 미주신경 자극으로 부교감 활성화, 코르티솔 감소 → 도파민 신호 전달의 SNR 개선. "각성 후 안정화" 효과 극대화.
- **목표 프라이밍** — VTA 도파민 뉴런은 목표 지향 행동 개시에 필수. 회복된 민감도를 명시적 의도와 결합해 실제 행동 전환 확률 상승.

### 연구 문서 (`research/`)

| 문서 | 핵심 내용 |
|---|---|
| `dopamine_scientific_research_2024_2026.md` | 2024–2026 도파민 과학 종합 — 수용체 가소성, 행동 중독 회로 |
| `dopamine_receptor_downregulation_revised.md` | D2 수용체 하향조절 메커니즘과 회복 경로의 체계적 분석 |
| `dopamine_measurement_research_synthesis.md` | SRT·핑거 탭핑·인지 과제를 도파민 시스템 상태의 행동 프록시로 활용하는 근거 |
| `acute_cognitive_reset_evidence.md` | 60–90초 능동 과제가 DMN→TPN 전환과 VTA-D1 경로를 매개한다는 신경과학적 증거 |

> 본 근거들은 원본 기획(dopamine-ease) PRD v2.7 §23 "부록: 과학적 근거 요약"에서 제품 요구사항과 직접 매핑되어 있습니다.

## ✦ ADHD-Friendly 설계 원칙

- **90초 완결** — 보상 없이 90초 이상 지속되는 구간 없음
- **즉각 피드백** — 리셋 직후 점수 변화를 시각적으로 확인
- **최소 마찰** — 앱 실행 → 1탭으로 리셋 시작
- **중도 이탈 허용** — 미완료 세션은 기록 제외, 패널티 없음
- **OLED 우선 다크** — 망막 자극 최소화, 야간 사용 친화

## ✦ 관련 프로젝트

- **dopamine-ease** — 원본 기획 (PRD v2.7, SDD v1.7, React Native/Expo 설계)
- **product-junhyeok** — dopamine-rush 컨셉, AI Camp 병렬 진행

---

<sub>Made with neuroscience, not dopamine.</sub>
