"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const faqs = [
  {
    q: "정말 스마트폰만으로 촬영해도 되나요?",
    a: "네, 최신 스마트폰이면 충분합니다. 별도의 카메라나 조명 장비가 없어도 됩니다. 자연광에서 촬영하는 것만으로도 좋은 결과물을 만들 수 있어요.",
  },
  {
    q: "첫 영상 3만원은 어떻게 받나요?",
    a: "크리에이터로 가입한 후 첫 번째 영상을 업로드하고 승인이 완료되면, 등록한 계좌로 3만원이 지급됩니다.",
  },
  {
    q: "편집을 못 해도 참여할 수 있나요?",
    a: "물론입니다. 편집 능력은 필수가 아닙니다. 촬영 원본만 올려주셔도 되고, 필요한 경우 저희 팀이 편집을 도와드립니다.",
  },
  {
    q: "얼마나 자주 촬영해야 하나요?",
    a: "정해진 의무 활동량은 없습니다. 캠페인을 선택적으로 참여할 수 있으며, 본업이나 학업과 병행하기 좋습니다.",
  },
  {
    q: "수익 정산은 어떻게 이루어지나요?",
    a: "영상 승인 완료 후 정산 주기에 따라 등록한 계좌로 입금됩니다. 정산 현황은 대시보드에서 실시간으로 확인할 수 있습니다.",
  },
  {
    q: "가입 후 탈퇴가 자유로운가요?",
    a: "네, 언제든 자유롭게 탈퇴할 수 있습니다. 위약금이나 별도 비용은 전혀 없습니다.",
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
          open ? "max-h-40 pb-5" : "max-h-0"
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
