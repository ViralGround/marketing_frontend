// 랜딩 페이지(비로그인) 공개 API 응답 타입. 백엔드 dto/landing/* 과 1:1 대응.

export interface FeaturedCampaign {
  id: number;
  title: string;
  brandName: string;
  rewardAmount: number;
  deadline: string | null;
  maxParticipants: number;
  applicationCount: number;
  thumbnailUrl: string | null;
  /** 작성 기업의 회원 ID. null 이면 회사 프로필이 없어 소개 모달 조회 불가(브랜드명만 표시). */
  companyMemberId: number | null;
  /** 작성 기업 로고 URL. null 이면 카드 원형은 brandName 이니셜로 폴백. */
  logoUrl: string | null;
}

export interface CompanyOpenCampaign {
  id: number;
  title: string;
  rewardAmount: number;
  deadline: string | null;
}

export interface CompanyPublic {
  companyName: string;
  industry: string | null;
  homepage: string | null;
  introduction: string | null;
  logoUrl: string | null;
  openCampaigns: CompanyOpenCampaign[];
}
