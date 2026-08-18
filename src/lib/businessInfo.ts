/**
 * 사업자 정보 표기 — 전자상거래법·정보통신망법 필수 고지 항목.
 *
 * 값은 전부 환경변수에서 온다. 빈 값인 행은 렌더하지 않으며(개발 환경),
 * 프로덕션 빌드는 next.config.ts 가드가 필수 항목 누락 시 빌드를 실패시킨다.
 * 코드에 실제 사업자 정보를 하드코딩하지 않는다 — 등기 변경 시 배포 없이 교체.
 */

export interface BusinessInfoRow {
  label: string;
  labelEn: string;
  value: string;
}

function entry(label: string, labelEn: string, value: string | undefined): BusinessInfoRow | null {
  const trimmed = value?.trim();
  return trimmed ? { label, labelEn, value: trimmed } : null;
}

export function getBusinessInfoRows(): BusinessInfoRow[] {
  return [
    entry("상호", "Company", process.env.NEXT_PUBLIC_BUSINESS_NAME),
    entry("대표자", "CEO", process.env.NEXT_PUBLIC_BUSINESS_CEO),
    entry("사업자등록번호", "Business reg. no.", process.env.NEXT_PUBLIC_BUSINESS_REG_NO),
    entry("통신판매업 신고", "Mail-order sales reg.", process.env.NEXT_PUBLIC_BUSINESS_MAIL_ORDER_NO),
    entry("주소", "Address", process.env.NEXT_PUBLIC_BUSINESS_ADDRESS),
    entry("문의", "Contact", process.env.NEXT_PUBLIC_BUSINESS_CONTACT),
  ].filter((row): row is BusinessInfoRow => row !== null);
}
