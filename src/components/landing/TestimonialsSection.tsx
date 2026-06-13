"use client";

import Badge from "@/components/ui/Badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLang } from "@/lib/i18n";

// 수입·후기 문구는 예시(placeholder). 2명은 월 100만원 이상.
const TESTIMONIALS = [
  {
    name: "김*진",
    avatar: "SJ",
    incomeKo: "월 38만원",
    incomeEn: "₩380K/mo",
    roleKo: "대학생 · 1개월 활동",
    roleEn: "Student · 1 month",
    quoteKo: "학교 다니면서 공강 시간에 틈틈이 촬영했어요. 폰 하나로만 찍어도 돼서 부담 없이 시작했는데, 한 달 만에 쏠쏠한 용돈벌이가 됐어요. 장비 살 돈이 없었는데 제작 지원이 다 돼서 정말 좋았습니다. 친구들한테도 자신 있게 추천하고 있어요.",
    quoteEn: "I filmed between classes whenever I had a free period. Starting was easy since all I needed was my phone, and within a month it became solid pocket money. I had no budget for gear, but everything was covered, which was a huge relief. Now I recommend it to my friends with confidence.",
  },
  {
    name: "이*호",
    avatar: "JH",
    incomeKo: "월 52만원",
    incomeEn: "₩520K/mo",
    roleKo: "직장인 · 2개월 활동",
    roleEn: "Office worker · 2 months",
    quoteKo: "퇴근하고 하루 1~2시간만 투자해서 꾸준히 올리고 있어요. 본업에 전혀 지장이 없어서 부업으로 딱이에요. 처음엔 영상 만드는 게 어색했는데 가이드가 자세해서 금방 적응했어요. 매달 따박따박 들어오는 추가 수입이 정말 쏠쏠합니다.",
    quoteEn: "I put in just 1-2 hours after work and post consistently. It never gets in the way of my day job, so it's a perfect side gig. Making videos felt awkward at first, but the guides were detailed enough that I adapted quickly. The extra income that lands every month really adds up.",
  },
  {
    name: "박*지",
    avatar: "MJ",
    incomeKo: "월 132만원",
    incomeEn: "₩1.32M/mo",
    roleKo: "프리랜서 · 4개월 활동",
    roleEn: "Freelancer · 4 months",
    quoteKo: "부업으로 가볍게 시작했는데 지금은 본업만큼 벌고 있어요. 꾸준히 올리다 보니 조회수가 터지면서 성과급이 크게 붙었어요. 여기서 쌓은 콘텐츠 경험으로 제 개인 채널 구독자도 같이 늘었고요. 시간을 자유롭게 쓰는 프리랜서한테 정말 잘 맞는 일이에요.",
    quoteEn: "I started lightly as a side gig, but now I earn as much as my main work. Posting steadily made my views blow up, and the performance bonuses grew significantly. The content experience I built here also grew my own channel's followers. For a freelancer who values flexible hours, it fits perfectly.",
  },
  {
    name: "정*우",
    avatar: "JW",
    incomeKo: "월 45만원",
    incomeEn: "₩450K/mo",
    roleKo: "직장인 · 2개월 활동",
    roleEn: "Office worker · 2 months",
    quoteKo: "팔로워가 0이었는데도 시작할 수 있다는 게 신기했어요. 조회수에 따라 성과급이 바로바로 붙으니까 동기부여가 확실해요. 처음 한 달은 감을 잡는 시간이었고, 둘째 달부터 수입이 눈에 띄게 늘었어요. 큰 욕심 안 부려도 부담 없이 이어갈 수 있어요.",
    quoteEn: "I was amazed I could start with zero followers. Bonuses get added right away based on views, so the motivation is real. The first month was about getting the hang of it, and from the second month my income grew noticeably. Even without overdoing it, it's easy to keep going.",
  },
  {
    name: "한*은",
    avatar: "HE",
    incomeKo: "월 64만원",
    incomeEn: "₩640K/mo",
    roleKo: "주부 · 3개월 활동",
    roleEn: "Homemaker · 3 months",
    quoteKo: "아이 재우고 나서 하루 한 편씩 올리는 게 어느새 루틴이 됐어요. 집안일 사이사이에 할 수 있어서 시간 부담이 거의 없어요. 처음엔 내가 할 수 있을까 걱정했는데, 막상 해보니 생각보다 훨씬 쉬웠어요. 매달 생활비에 보탬이 돼서 아주 만족하고 있습니다.",
    quoteEn: "Posting one video a day after the kids fall asleep quietly became my routine. I can do it between chores, so it barely takes extra time. I worried whether I could even do it, but it turned out much easier than I expected. It adds to our monthly household budget, so I'm very happy with it.",
  },
  {
    name: "오*준",
    avatar: "OJ",
    incomeKo: "월 116만원",
    incomeEn: "₩1.16M/mo",
    roleKo: "대학생 · 4개월 활동",
    roleEn: "Student · 4 months",
    quoteKo: "정산이 빨라서 한 번 받고 나니 계속하게 되더라고요. 처음 두 달은 기본급 위주였는데, 감을 잡고 나서 조회수가 오르니 수입이 두 배 이상 뛰었어요. 학생이 이 정도 버는 게 가능하다는 걸 직접 경험하니 신기해요. 졸업 전까지 제대로 키워볼 생각이에요.",
    quoteEn: "Payouts are fast, and once I got paid the first time I kept going. The first two months were mostly base pay, but once I found my groove the views climbed and my income more than doubled. Experiencing first-hand that a student can earn this much is wild. I plan to grow it properly before I graduate.",
  },
];

// 후기 아바타 — Memoji 풍 일러스트 아바타(DiceBear avataaars). 이름 기반 자동 생성이라 사람마다 얼굴이 다름.
// (애플 Memoji 는 독점이라 사용 불가 — 가장 비슷한 무료 일러스트 아바타로 대체)
const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&radius=50&backgroundColor=ede9fe,dbeafe,dcfce7,fce7f3,ffedd5`;

export default function TestimonialsSection() {
  const ref = useScrollAnimation<HTMLDivElement>();
  const { t } = useLang();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          {t("먼저 시작한 크리에이터들의 이야기", "Stories from creators who started first")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted">
          {t(
            "거창한 장비도, 많은 팔로워도 없이 시작했어요.",
            "They started without fancy gear or a big following.",
          )}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.name}
              className="flex flex-col rounded-2xl border border-line bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Badge className="mb-4 self-start px-3 py-1 text-sm font-semibold">
                {t(item.incomeKo, item.incomeEn)}
              </Badge>
              <p className="text-sm leading-relaxed text-muted">{t(item.quoteKo, item.quoteEn)}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl(item.avatar)}
                  alt=""
                  aria-hidden="true"
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-full bg-primary/5 ring-1 ring-black/5 dark:ring-white/10"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-faint">{t(item.roleKo, item.roleEn)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
