/**
 * 캠페인 수정 가능 여부 정책. 백엔드 가드(AdminService, CompanyService)와 일치해야
 * 한다. 프론트가 백엔드보다 넓게 열면 INVALID_ESCROW_STATE 가 나고, 좁게 닫으면
 * 사용자가 답답해한다.
 */

export type EscrowStatus =
  | "NONE"
  | "PENDING_DEPOSIT"
  | "DEPOSIT_CONFIRMING"
  | "FUNDED"
  | "PARTIALLY_RELEASED"
  | "RELEASED"
  | "REFUNDED";

export type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED";
export type CampaignEditorRole = "ADMIN" | "COMPANY";

/**
 * 보상·모집인원 변경 가능 여부. 정산 무결성 보호를 위해 예치금이 잠기기 전까지만 허용.
 *
 * - 관리자: NONE 또는 PENDING_DEPOSIT
 * - 기업: PENDING_DEPOSIT (NONE 은 기업이 만들 수 없는 상태)
 *
 * 두 역할 모두 예치 후엔 변경 불가. 보상을 늘리면 추가 deposit, 줄이면 환불 처리가
 * 필요해서 단순히 풀어주면 회계가 어긋난다.
 */
export function canEditBudget(
  role: CampaignEditorRole,
  escrowStatus: EscrowStatus,
): boolean {
  if (role === "ADMIN") {
    return escrowStatus === "NONE" || escrowStatus === "PENDING_DEPOSIT";
  }
  return escrowStatus === "PENDING_DEPOSIT";
}

/**
 * 보상·인원 외 필드(썸네일·제목·설명·요구사항·마감일) 변경 가능 여부.
 * 표시 정보라 정산과 무관하므로 거의 항상 열려있다.
 *
 * - 관리자: 항상 가능 (CLOSED 상태에서도 운영상 정정 필요)
 * - 기업: 종결 상태(CLOSED, REFUNDED)만 잠금
 */
export function canEditCampaignFields(
  role: CampaignEditorRole,
  escrowStatus: EscrowStatus,
  campaignStatus: CampaignStatus,
): boolean {
  if (role === "ADMIN") return true;
  if (campaignStatus === "CLOSED") return false;
  if (escrowStatus === "REFUNDED") return false;
  return true;
}
