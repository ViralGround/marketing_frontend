"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    q: "기본급과 성과급은 어떻게 계산되나요?",
    a: "영상 1편을 업로드(포스팅)하시면 제작지원금 2만원이 확정 지급됩니다. 여기에 더해 조회수 구간별 성과급이 최대 250만원까지 별도로 지급되며, 두 금액은 완전히 별개로 합산됩니다.",
  },
  {
    q: "정말 스마트폰만으로 촬영해도 되나요?",
    a: "네, 최신 스마트폰이면 충분합니다. 별도의 카메라나 조명 장비가 없어도 됩니다. AI 제작 툴과 편집 툴은 Viral Ground가 전액 무료로 지원합니다.",
  },
  {
    q: "업로드 일정은 어떻게 되나요?",
    a: "캠페인에 따라 일정이 안내되지만, 일반적으로 주 2회(예: 목요일, 일요일) 업로드를 권장하며 마감 시간 전까지 콘텐츠를 전달주시면 됩니다. 본업이나 학업과 병행할 수 있도록 설계되어 있습니다.",
  },
  {
    q: "계약 기간은 어떻게 되나요?",
    a: "1개월 단위로 계약을 진행합니다. 한 달 단위로 가볍게 시작하고, 잘 맞으면 갱신 협의로 자연스럽게 이어집니다. 위약금은 없습니다.",
  },
  {
    q: "정산은 언제, 어떻게 받나요?",
    a: "마지막 영상 업로드 후 14일을 기준으로 등록한 계좌로 일괄 입금됩니다. 정산 명세는 ① 제작지원금(업로드 편수 × 20,000원) ② 성과급(각 영상의 조회수 구간에 따라 산정) 두 항목이 합산된 금액이며, 캠페인별 단가는 매칭 시 별도 안내드립니다.",
  },
  {
    q: "구독자가 적어도 참여할 수 있나요?",
    a: "네, 구독자 수와 관계없이 지원 가능합니다. Viral Ground는 채널 규모보다 콘텐츠 적합도를 기준으로 매칭하며, 활동을 이어가면 자연스럽게 본인 채널도 성장합니다.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-medium text-foreground pr-4">{q}</span>
        <Plus
          className={`h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
          strokeWidth={2.5}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm text-muted leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const ref = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="bg-section-alt py-20 md:py-28">
      <div ref={ref} className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          자주 묻는 질문
        </h2>
        <p className="mt-4 text-center text-muted">
          궁금한 점이 있으신가요?
        </p>

        <div className="mt-12">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
