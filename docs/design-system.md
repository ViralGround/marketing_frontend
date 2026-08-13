# Viral Ground Design System

## 0. 브랜드 세계 — 고정 원칙

**미학 방향(2–3단어): Seoul editorial print.** 모든 시각 결정은 이 방향에 근거를 대야 한다. "클린·모던"은 방향이 아니라 방향의 부재다.

**Visual thesis:** 서울의 독립 편집물을 연상시키는 따뜻한 종이와 진한 잉크 위에 전기 보라를 한 번만 강하게 쓰고, Archivo Black 영문 디스플레이가 영상의 에너지를 끌어낸다.

**Content plan:** 첫 화면에서 AI SaaS와 크리에이터의 연결을 명확히 설명하고, 운영 방식과 콘텐츠 포맷을 보여준 뒤 마지막 역할 CTA로 끝낸다. 검증되지 않은 성과·보상·금융 약속은 장식 숫자로도 사용하지 않는다.

**Interaction thesis:** 인트로는 0.5초 이내의 비차단 신호, 스크롤 필름은 페이지의 한 번뿐인 큰 움직임, 메뉴·링크는 잉크 룰과 정밀한 밑줄 전환으로 반응한다. `prefers-reduced-motion`에서는 인트로·자동재생·스크롤 연출을 모두 제거하고 정적인 편집 레이아웃을 제공한다.

### 공개·인증 화면 공통 문법

- `--paper`는 단순한 회색 배경이 아니라 브랜드의 기본 재료다. 공개 페이지와 인증 진입 화면에서 유지한다.
- `--ink`는 본문뿐 아니라 1–2px 룰드 라인, 큰 면, 명확한 focus 상태에 사용한다.
- `--violet`는 역할 CTA, 현재 상태, 한 문장의 핵심에만 쓴다. 여러 강조색을 경쟁시키지 않는다.
- Archivo Black은 영문 디스플레이·짧은 수치·브랜드 문장 전용이다. 한글 본문과 긴 안내문에는 Pretendard를 쓴다.
- 공개 랜딩은 섹션·선·영상으로 구성한다. 동일한 크기의 SaaS 카드 그리드를 기본 골격으로 사용하지 않는다.
- 인증 화면은 흰 카드만 띄우지 않고 종이·잉크·보라 세계를 이어가되, 실제 입력은 차분하고 익숙한 폼 패턴을 따른다.
- 모든 터치 컨트롤은 최소 44px, 핵심 CTA는 48–56px를 확보한다.
- 오류는 빈 상태로 위장하지 않는다. 문제, 사용자가 할 수 있는 복구 행동, 다시 시도 버튼을 함께 제공한다.
- 결제·정산·성과 문구는 실제 운영 환경에서 활성화되고 검증된 기능만 현재형으로 표현한다.

### 법적 동의 버전

- 가입 화면에 표시하는 약관 버전과 API로 보내는 버전은 같은 값을 사용한다.
- 배포 시 backend `LEGAL_*_VERSION`과 frontend `NEXT_PUBLIC_LEGAL_*_VERSION`을 반드시 함께 변경한다.
- frontend 변수는 `TERMS`, `PRIVACY`, `AGE14`, `CREATOR_THIRD_PARTY`, `MARKETING` 다섯 종류다. 선택 마케팅 동의가 꺼져 있으면 `marketingVersion`을 보내지 않는다.
- 환경변수가 없는 로컬 기본값은 `v1.0-draft`다. 법적 검토 전 문서를 운영 확정본처럼 표시하지 않는다.

> **톤**: 토스의 트렌디함 + 신뢰감을 보라 색상에 옮긴 시스템.
> **SSOT**: 이 문서가 디자인 토큰의 단일 원천. `src/app/globals.css` 의 토큰과 1:1 대응.
> 새 토큰을 추가하거나 값을 바꾸려면 **이 문서 → globals.css** 순서로 동기화한다.

---

## 1. Color Tokens

### 1.1 Brand (Primary)

색상 선택 근거: **Viral Ground 시그니처 보라 (violet)**. 브랜드 아이덴티티의 핵심. 주변 surface/line 은 토스 톤의 차분한 회색으로 받쳐 신뢰감을 만든다.

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `--primary` | `#7C3AED` | `#A78BFA` | 핵심 CTA, 강조 텍스트, 활성 상태 |
| `--primary-light` | `#A78BFA` | `#C4B5FD` | hover, 부드러운 강조 |
| `--primary-dark` | `#5B21B6` | `#7C3AED` | active, pressed |
| `--primary-bg` | `#F5F3FF` | `#1A1025` | 배지·tag 의 배경 hint |

Tailwind: `bg-primary`, `text-primary`, `border-primary`, `bg-primary-bg` 등.

### 1.2 Surface · Content

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#0B0D12` | 페이지 배경 |
| `--surface` | `#FFFFFF` | `#131722` | 카드 본체 |
| `--surface-muted` | `#F7F8FA` | `#1A1F2C` | 섹션 배경, hover row |
| `--surface-chip` | `#EEF0F4` | `#232A3A` | 작은 칩·input bg |
| `--foreground` | `#0F1115` | `#ECEEF3` | 본문 텍스트 |
| `--content-soft` | `#3A3F4B` | `#CED3DD` | 보조 본문 |
| `--muted` | `#6B7280` | `#8B92A1` | 라벨·캡션 |
| `--faint` | `#9CA3AF` | `#5F6675` | placeholder·미세 안내 |
| `--line` | `#E5E8EE` | `#232A3A` | 구분선·테두리 |
| `--line-strong` | `#D2D6DC` | `#353D4F` | 강조 테두리·input border |

### 1.3 Semantic State

| 토큰 | Light | Dark | 용도 |
|---|---|---|---|
| `--success` | `#16A34A` | `#4ADE80` | 승인·완료 배지 |
| `--warning` | `#D97706` | `#FBBF24` | 검토 요청·주의 |
| `--error` | `#DC2626` | `#F87171` | 실패·거절 |
| `--info` | `#2563EB` | `#60A5FA` | NEW·중립 알림 |

**원칙**: 상태 색은 텍스트보다 배지/아이콘에 우선 적용. 본문 텍스트 색으로 남발 금지.

---

## 2. Typography

### 2.1 Font Family

| 토큰 | 폰트 | 용도 |
|---|---|---|
| `--font-sans` (`font-sans`) | **Pretendard Variable** → system sans (fallback) | 본문·로고·메트릭 등 사이트 전체 |
| `--font-mono` (`font-mono`) | ui-monospace 시스템 스택 | 코드·숫자 정렬용 |
| `--font-display` (`font-display`) | **Archivo Black** | 영문 디스플레이·짧은 수치 전용 |

폰트는 이 2+1축이 전부다. Geist/Geist Mono 는 미사용 프리로드였으므로 제거(2026-08-13).

Pretendard 는 `dynamic-subset` 으로 import — 사용된 글자만 다운로드.
Pretendard Variable 이 100~900 weight 를 모두 지원하므로 로고·헤드라인·큰 메트릭 숫자까지 한 폰트로 처리.

### 2.2 Scale (Tailwind 기본 사용)

| 용도 | 클래스 | 사이즈 |
|---|---|---|
| Display (랜딩 헤드라인) | `text-5xl md:text-6xl lg:text-7xl` | 48~72px |
| Section heading | `text-3xl md:text-4xl` | 30~36px |
| Card heading | `text-lg md:text-xl` | 18~20px |
| Body | `text-base` | 16px (본문 기본) |
| Caption | `text-sm` | 14px |
| Micro | `text-xs` | 12px (라벨·meta) |

### 2.3 Weight

| 용도 | Weight | 클래스 |
|---|---|---|
| 본문 | 400 / 500 | `font-normal` / `font-medium` |
| 강조 본문 | 600 | `font-semibold` |
| 헤드라인 | 700 / 800 | `font-bold` / `font-extrabold` |
| 메트릭 숫자 | 900 | `font-black` + `tracking-tight` |

### 2.4 Line height · Tracking

- 헤드라인: `leading-tight tracking-tight`
- 본문: `leading-relaxed`
- 메트릭 숫자: `tracking-tight` (가까이 붙여 임팩트)

---

## 3. Spacing

Tailwind 기본 4px grid 사용. 토스 톤을 살리려면 **여유롭게** 잡는다.

| 용도 | 권장 |
|---|---|
| 섹션 상하 패딩 | `py-20 md:py-28` (랜딩), `py-12 md:py-16` (일반) |
| 카드 padding | `p-6 md:p-8` (보통), `p-8 md:p-10` (Hero·CTA) |
| 컴포넌트 간 갭 | `gap-4` (작음), `gap-6 md:gap-8` (보통) |
| 컨테이너 좌우 | `px-6 md:px-10` |

---

## 4. Radius

토스 톤은 **둥글둥글**. 작은 요소도 라운드 충분히 준다.

| 용도 | 클래스 | 값 |
|---|---|---|
| 칩·배지 | `rounded-full` | full |
| Input·작은 카드 | `rounded-lg` | 8px |
| 일반 카드 | `rounded-2xl` | 16px |
| 큰 카드·CTA 박스 | `rounded-3xl` | 24px |
| Hero 메트릭 카드 | `rounded-3xl` | 24px |

**원칙**: 같은 위계의 요소는 같은 radius. 카드 안의 카드는 부모보다 한 단계 작게.

---

## 5. Shadow

토스 톤은 **거의 무그림자** + 필요한 곳만 soft shadow.

| 용도 | 클래스 |
|---|---|
| 플랫 카드 | 무그림자 + `border border-line` |
| 떠보이는 카드 | `shadow-sm` |
| Hero·Bottom CTA | `shadow-lg` |
| 모달·드롭다운 | `shadow-2xl` |

다크모드에선 그림자 무용. `border-line` 으로 대체.

---

## 6. Motion

| 용도 | 시간 | Easing | 비고 |
|---|---|---|---|
| Hover (color/opacity) | `transition-colors duration-200` | 기본 | 모든 인터랙티브 요소 |
| 카드 lift | `transition-all duration-300 hover:-translate-y-0.5` | ease-out | `cursor-pointer` 인 카드 |
| Fade-in | `useScrollAnimation` 훅 | 0.7s ease-out | 스크롤 진입 |
| 모달 | `duration-200` | ease-out | open/close |

**Reduced motion**: `globals.css` 에 `@media (prefers-reduced-motion: reduce)` 가 모든 애니메이션 끄게 처리. 새 애니메이션 추가 시 이 블록도 같이 확장.

---

## 7. Primitives (`src/components/ui/`)

Phase 2 에서 신설. **새 페이지·새 코드는 이 primitive 를 우선 사용**. 기존 ad-hoc 패턴은 Phase 3-4 에서 점진 마이그레이션.

### Button — `@/components/ui/Button`

```tsx
import Button from "@/components/ui/Button";

<Button>지원하기</Button>                              // primary · md (기본)
<Button variant="secondary">취소</Button>
<Button variant="ghost" size="sm">더보기</Button>
<Button variant="primary" size="lg" fullWidth>가입하기</Button>
<Button disabled>처리 중...</Button>
```

| prop | 값 | 기본 |
|---|---|---|
| `variant` | `"primary"` / `"secondary"` / `"ghost"` | `"primary"` |
| `size` | `"sm"` / `"md"` / `"lg"` | `"md"` |
| `fullWidth` | boolean | `false` |
| 기타 | 모든 `<button>` 표준 속성 | — |

- 라운드 항상 `full` (토스 톤).
- 포커스 시 `ring-primary/30` 자동.
- `disabled` 시 opacity 50% + cursor not-allowed.
- Link 가 필요하면 `<Link>` 안에 감싸지 말고 `<Link className="...same as Button...">` 패턴 사용 (Phase 3 에서 LinkButton 정리 검토).

### Card — `@/components/ui/Card`

```tsx
import Card from "@/components/ui/Card";

<Card>일반 카드</Card>                              // flat (기본)
<Card variant="elevated">살짝 떠있는 카드</Card>
<Card variant="highlight">보라 그라데이션 + 흰 텍스트</Card>
<Card className="rounded-3xl p-10">큰 영역</Card>     // 오버라이드
```

| prop | 값 | 기본 |
|---|---|---|
| `variant` | `"flat"` / `"elevated"` / `"highlight"` | `"flat"` |
| 기타 | 모든 `<div>` 표준 속성 | — |

- 라운드 `2xl`(16px). 큰 영역(Hero CTA)은 `className="rounded-3xl"` 으로 오버라이드.
- padding 기본 `p-6 md:p-8`. 더 좁게 쓰려면 `className="p-4"` 로 덮음.

### Badge — `@/components/ui/Badge`

```tsx
import Badge from "@/components/ui/Badge";

<Badge>모집중</Badge>                              // primary (기본)
<Badge tone="success">승인됨</Badge>
<Badge tone="warning">검토 요청</Badge>
<Badge tone="error">거절</Badge>
<Badge tone="info">NEW</Badge>
<Badge tone="neutral">초안</Badge>
```

| prop | 값 | 기본 |
|---|---|---|
| `tone` | `"primary"` / `"success"` / `"warning"` / `"error"` / `"info"` / `"neutral"` | `"primary"` |

### Input — `@/components/ui/Input`

```tsx
import Input from "@/components/ui/Input";

<Input type="email" placeholder="example@email.com" />
<Input className="mt-1" required value={form.email} onChange={...} />
```

- 모든 `<input>` 표준 속성 사용 가능.
- placeholder 는 `faint`, 본문은 `foreground`.
- focus 시 `border-primary` + `ring-primary/20`.

---

## 8. 마이그레이션 가이드 (Phase 3-4)

기존 페이지를 새 시스템으로 옮길 때:

1. **하드코딩 색상 제거**: `bg-white` → `bg-surface`, `text-gray-500` → `text-muted`, `border-gray-200` → `border-line`
2. **버튼 라운드 통일**: `rounded-lg` → `rounded-full` (CTA 의 경우)
3. **여백 키우기**: `py-12` → `py-16/20`, `p-6` → `p-8`
4. **`shadow` 절제**: 강한 그림자 제거, `border-line` 으로 분리감 유지
5. **메트릭 강조**: 핵심 숫자는 `font-brand text-5xl+ font-black tracking-tight`

각 페이지 마이그레이션 후 시각 검증 필수.

---

## 9. Iconography

**`lucide-react` 단일 set 사용.** 장식용 유니코드 이모지(⏰📱⚡🎯✅🔒 등) 금지 — AI 티가 나고 톤과 안 맞음.

```tsx
import { Check, X, Clock, Smartphone, Zap, Target, TrendingUp, Lock } from "lucide-react";

<Check className="h-5 w-5" />
<X className="h-4 w-4" />
```

### 사이즈 가이드

| 용도 | 클래스 |
|---|---|
| 작은 UI (배지, 닫기 버튼) | `h-4 w-4` |
| 일반 본문 inline | `h-5 w-5` |
| 카드 헤더 아이콘 | `h-6 w-6` |
| 큰 feature 카드 (이전 이모지 자리) | `h-8 w-8` (카드 내 강조) |

### 색

- 일반: `text-content-soft` (본문 톤)
- 강조: `text-primary`
- 상태: `text-success` / `text-warning` / `text-error` / `text-info`

자주 쓰는 매핑(참고):
- 체크/완료 → `Check`, `CheckCircle2`
- 닫기 → `X`
- 시간·일정 → `Clock`, `Calendar`
- 디바이스 → `Smartphone`, `Monitor`
- 속도·성과 → `Zap`, `TrendingUp`, `Target`
- 결제·자산 → `Wallet`, `Banknote`
- 데이터 → `BarChart3`, `LineChart`
- 보안 → `Lock`, `ShieldCheck`
- 협업·매칭 → `Users`, `Handshake`
- 콘텐츠 → `Video`, `PenLine`, `Sparkles`

## 10. 공개(시안4) 계층 정밀 규칙 — 2026-08-13 AI-tells audit 반영

이 문서는 두 계층을 다룬다. §1–§7 은 **앱(토스톤) 계층**, §0 과 이 절은 **공개(시안4) 계층**이다.
공개 페이지를 수정할 때는 이 절이 우선한다.

### 10.1 타입 스케일 — 1.25 램프 (30px 미만 고정 크기)

30px 미만 임의 크기 17종을 아래 5단계로 통일했다. 새 크기를 만들지 말 것 —
인접 단계 비율이 1.25 미만이면 독자는 차이를 인식하지 못한다.

| 단계 | 값 | 용도 |
|---|---|---|
| micro | `text-[12px]` | 마이크로 라벨, 표 헤더, 인덱스 번호 (10·11px 폐지 — 12px 이 하한) |
| caption | `text-[15px]` | 캡션, 부가 정보, 버튼 라벨 (13·13.5·14·14.5px 흡수) |
| body | `text-[18px]` | 본문, 리드 문단 (15.5·16·17px 흡수) |
| lead | `text-[22px]` | 항목 제목, 오류 헤딩 (19px 흡수) |
| title | `text-[28px]` | 카드/스텝 제목 상한 (26px 흡수) |

디스플레이 대역(≥30px clamp)은 기존 값 유지 — 단계가 충분히 벌어져 있다.

### 10.2 섹션 여백 — 0.75 등비 램프

모든 섹션이 같은 여백이면 어떤 섹션도 중요해 보이지 않는다.

| 위계 | 클래스 | 용도 |
|---|---|---|
| 종결 | `py-24 md:py-32` | 하단 CTA 블록 (마지막을 크게 열어 종결감) |
| 핵심 | `py-16 md:py-24` | 보상·프로세스 등 본론 섹션 |
| 보조 | `py-12 md:py-[72px]` | FAQ·신뢰 안내 등 |

### 10.3 한글 조판 하한 (라틴 기준 도구가 잡지 못하는 규칙)

한글 음절 블록은 가상 정사각형에 꽉 차 있어 라틴보다 자간·행간 여유가 필요하다.

- 한글 디스플레이 자간 하한: **-0.035em** (라틴 전용 Archivo Black 은 -0.04em 허용)
- 한글 본문 자간 하한: **-0.02em**
- 한글 헤딩 행간 하한: **1.2**
- 한글 본문 1행 길이: 25–40자 (`max-w-xl` ≈ 37자 = 적정)
- 나열 구분은 중점(`·`) — 한국 조판 관습, em-dash 밀도 룰 적용 대상 아님

### 10.4 브라우저 표면 테마 (craft-floor "Browser surfaces")

그리지 않은 부분도 디자인을 실어 나른다. `globals.css` 전역에 정의:

- `::selection` — 흰 글자 + 보라 배경
- `:focus-visible` — 3px 보라 아웃라인
- `caret-color` — 입력 캐럿 보라
- 숫자 열(표·지표·금액)에는 반드시 `tabular-nums` — 비례 숫자는 자릿수 정렬이 무너진다

### 10.5 금지 목록 (공개 계층)

- **kicker/eyebrow**: 헤딩 위 소형 uppercase 라벨·알약 칩 금지. 어떤 명분으로도 예외 없음 —
  헤딩이 스스로 말하게 하라. 라벨의 정보는 헤딩 문안이나 본문으로 흡수.
- **카드 안의 카드(nested cards)**: 항상 잘못. 내부 정보는 룰드 행(`divide-y` / `border-b`)으로.
- **동일 크기 카드 그리드**: §0 의 기존 금지 유지. 목록은 룰드 리스트 문법.
- **유니코드 글리프 아이콘**(→·★ 등): lucide 단일 세트로. 같은 화살표가 두 서체로 그려지면 안 된다.
- **레이아웃 속성 애니메이션**(padding/margin/width): hover 들여쓰기는 `transform: translateX()` 로.
- **순서 없는 01/02/03**: 번호는 순서 자체가 정보일 때만(랭킹·단계·시간순). 병렬 항목엔 금지.
- **미사용 폰트 로드 금지**: 폰트는 Pretendard + Archivo Black 2축뿐이다.

### 10.6 색 — 공개 계층 보라

`--violet: #7331e0`, `--violet-bright: #9a64f5` — Tailwind 기본 스와치(violet-500/600)가 아닌
authored 값. **Tailwind 팔레트 hex 를 브랜드 색으로 그대로 쓰지 말 것.**
`--violet-soft`(#d9ccff) 배경 위 보조 텍스트는 회색 알파 금지 — 전용 `--violet-ink`(#3d2a70) 사용.
잉크 알파 하한: 페이퍼 위 본문 보조는 `ink/60` 이상(4.5:1), 잉크 배경 위는 `white/60` 이상.

## 11. 추후 추가 예정

- **Animations**: 스크롤 페이드인 외에 카운트업·shimmer 등 차차 도입
- **Illustrations**: 토스처럼 친근한 일러스트. 외주 또는 무료 라이브러리
