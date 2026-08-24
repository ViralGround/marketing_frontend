import { describe, expect, it } from "vitest";
import { TERMS_BODY } from "./terms";

describe("public terms for the non-transactional release", () => {
  it("states the separate-contract boundary without promising escrow or settlement", () => {
    expect(TERMS_BODY).toContain("별도 서면 계약");
    expect(TERMS_BODY).toContain("현재 서비스는 결제대행, 예치, 송금, 정산을 제공하지 않으며");
    expect(TERMS_BODY).not.toContain("예치금을 회사에 예치");
    expect(TERMS_BODY).not.toContain("기업의 승인 후 정산");
    expect(TERMS_BODY).not.toContain("정산 시점에 보상 금액");
    expect(TERMS_BODY).not.toContain("정산이 완료된 후 탈퇴");
  });
});
