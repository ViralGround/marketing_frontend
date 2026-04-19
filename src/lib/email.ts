import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

function getAdminRecipients(): string[] {
  return (process.env.ADMIN_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function escape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface NewCreatorNotification {
  memberId: number;
  name: string;
  email: string;
  gender: string | null;
  age: number | null;
  editingTool: string | null;
  faceExposure: boolean;
  instagramId: string | null;
  tiktokId: string | null;
  youtubeId: string | null;
}

export async function notifyAdminsOfNewCreator(
  data: NewCreatorNotification,
): Promise<void> {
  try {
    if (!resend) {
      console.warn("[email] RESEND_API_KEY not set; skipping admin notification.");
      return;
    }
    const recipients = getAdminRecipients();
    if (recipients.length === 0) {
      console.warn("[email] ADMIN_NOTIFICATION_EMAILS empty; skipping notification.");
      return;
    }

    const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const detailUrl = `${appUrl}/admin/members/${data.memberId}`;

    const rows: [string, string][] = [
      ["활동명", escape(data.name)],
      ["이메일", escape(data.email)],
      ["성별", escape(data.gender)],
      ["나이", escape(data.age)],
      ["편집 툴", escape(data.editingTool)],
      ["얼굴 공개", data.faceExposure ? "예" : "아니요"],
      ["인스타그램", escape(data.instagramId)],
      ["틱톡", escape(data.tiktokId)],
      ["유튜브", escape(data.youtubeId)],
    ];

    const rowsHtml = rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px;color:#666;border-bottom:1px solid #eee;">${k}</td><td style="padding:6px 12px;color:#111;border-bottom:1px solid #eee;">${v}</td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="margin:0 0 16px;color:#111;">새 크리에이터 가입 신청</h2>
        <p style="color:#444;margin:0 0 16px;">승인 대기 중인 크리에이터가 있습니다. 아래 정보를 확인하고 관리자 페이지에서 승인/거절해주세요.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:20px;">${rowsHtml}</table>
        <a href="${detailUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;">관리자 페이지에서 검토</a>
      </div>
    `;

    await resend.emails.send({
      from,
      to: recipients,
      subject: `[크리에이터 가입 신청] ${data.name}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send admin notification:", err);
  }
}

export interface NewApplicationNotification {
  applicationId: number;
  campaignId: number;
  campaignTitle: string;
  brandName: string;
  creatorName: string;
  creatorEmail: string;
  message: string | null;
}

export async function notifyAdminsOfNewApplication(
  data: NewApplicationNotification,
): Promise<void> {
  try {
    if (!resend) return;
    const recipients = getAdminRecipients();
    if (recipients.length === 0) return;

    const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const detailUrl = `${appUrl}/admin/campaigns/${data.campaignId}`;

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;">새 캠페인 지원 신청</h2>
        <p style="color:#444;margin:0 0 12px;">캠페인에 새로운 지원자가 등록되었습니다.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:20px;">
          <tr><td style="padding:6px 12px;color:#666;border-bottom:1px solid #eee;">캠페인</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escape(data.campaignTitle)}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;border-bottom:1px solid #eee;">브랜드</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escape(data.brandName)}</td></tr>
          <tr><td style="padding:6px 12px;color:#666;border-bottom:1px solid #eee;">지원자</td><td style="padding:6px 12px;border-bottom:1px solid #eee;">${escape(data.creatorName)} (${escape(data.creatorEmail)})</td></tr>
          <tr><td style="padding:6px 12px;color:#666;">지원 메시지</td><td style="padding:6px 12px;">${escape(data.message)}</td></tr>
        </table>
        <a href="${detailUrl}" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;">지원자 검토하기</a>
      </div>
    `;

    await resend.emails.send({
      from,
      to: recipients,
      subject: `[캠페인 지원] ${data.campaignTitle} — ${data.creatorName}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send new-application notification:", err);
  }
}

export async function notifyCreatorOfApplicationStatusChange(
  to: string,
  name: string,
  campaignTitle: string,
  status: "APPROVED" | "REJECTED" | "SETTLED",
  rewardAmount?: number | null,
): Promise<void> {
  try {
    if (!resend) return;
    const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";

    const statusText =
      status === "APPROVED"
        ? "참여가 승인되었습니다"
        : status === "REJECTED"
          ? "지원이 거절되었습니다"
          : "정산이 완료되었습니다";

    const bodyText =
      status === "APPROVED"
        ? `${escape(name)} 님의 "${escape(campaignTitle)}" 캠페인 참여가 승인되었습니다. 지금 영상 제작을 시작해주세요.`
        : status === "REJECTED"
          ? `${escape(name)} 님의 "${escape(campaignTitle)}" 캠페인 지원이 거절되었습니다. 다른 캠페인도 확인해보세요.`
          : `${escape(name)} 님의 "${escape(campaignTitle)}" 캠페인 보상 ${rewardAmount ? `₩${rewardAmount.toLocaleString("ko-KR")}` : ""}이(가) 정산되었습니다.`;

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 16px;">${statusText}</h2>
        <p style="color:#444;margin:0 0 16px;">${bodyText}</p>
        <a href="${appUrl}/creator/applications" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-size:14px;">내 지원 현황 보기</a>
      </div>
    `;

    await resend.emails.send({
      from,
      to,
      subject: `[${campaignTitle}] ${statusText}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send application status email:", err);
  }
}

export async function notifyCreatorOfStatusChange(
  to: string,
  name: string,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  try {
    if (!resend) return;
    const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const approved = status === "APPROVED";
    const subject = approved
      ? "크리에이터 가입이 승인되었습니다"
      : "크리에이터 가입 신청 결과 안내";
    const body = approved
      ? `<p>${escape(name)} 님, 가입이 승인되었습니다. 지금 바로 로그인하고 활동을 시작하세요.</p>
         <p><a href="${appUrl}/login">로그인하기</a></p>`
      : `<p>${escape(name)} 님, 아쉽게도 이번 가입 신청은 거절되었습니다. 문의 사항이 있으시면 회신해주세요.</p>`;

    await resend.emails.send({
      from,
      to,
      subject,
      html: `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">${body}</div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send status email:", err);
  }
}
