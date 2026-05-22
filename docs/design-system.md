# Viral Ground Design System

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
| `--font-sans` (`font-sans`) | **Pretendard Variable** → system → Geist (fallback) | 본문·UI 전반 |
| `--font-brand` (`font-brand`) | **Space Grotesk** | 로고, 큰 메트릭 숫자 |
| `--font-mono` (`font-mono`) | Geist Mono | 코드·숫자 정렬용 |

Pretendard 는 `dynamic-subset` 으로 import — 사용된 글자만 다운로드.

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
| 메트릭 숫자 | 900 (또는 Space Grotesk 700 fallback) | `font-black` + `font-brand` |

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

## 9. 추후 추가 예정

- **Animations**: 스크롤 페이드인 외에 카운트업·shimmer 등 차차 도입
- **Iconography**: lucide-react 또는 자체 SVG. 한 set 으로 통일
- **Illustrations**: 토스처럼 친근한 일러스트. 외주 또는 무료 라이브러리
