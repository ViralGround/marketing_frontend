"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import api from "@/lib/api";
import { removeTokens } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useLang } from "@/lib/i18n";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import Button from "@/components/ui/Button";

type AccountScope = "company" | "creator";
type DeleteError = "ACTIVE_CAMPAIGN" | "REQUEST_FAILED" | null;

const ACCOUNT_CONFIG = {
  company: {
    endpoint: "/company/me",
    successHref: "/login",
    campaignHref: "/company/campaigns",
    sectionDescription: {
      ko: "진행 중인 캠페인과 미정산 건이 모두 끝난 뒤 회사 계정을 탈퇴할 수 있습니다.",
      en: "You can delete the company account after all active campaigns and unsettled items are complete.",
    },
    trigger: { ko: "회사 계정 탈퇴", en: "Delete company account" },
    dialogTitle: {
      ko: "회사 계정을 탈퇴할까요?",
      en: "Delete this company account?",
    },
    exposure: {
      ko: "탈퇴가 완료되면 로그인과 회사 계정의 공개 노출이 즉시 차단됩니다.",
      en: "Once deletion is complete, sign-in and public exposure of the company account are blocked immediately.",
    },
    campaignLink: { ko: "캠페인 상태 확인", en: "Review campaign status" },
  },
  creator: {
    endpoint: "/me",
    successHref: "/",
    campaignHref: "/creator/mypage#creator-applications",
    sectionDescription: {
      ko: "진행 중인 캠페인과 미정산 건이 모두 끝난 뒤 크리에이터 계정을 탈퇴할 수 있습니다.",
      en: "You can delete the creator account after all active campaigns and unsettled items are complete.",
    },
    trigger: { ko: "크리에이터 계정 탈퇴", en: "Delete creator account" },
    dialogTitle: {
      ko: "크리에이터 계정을 탈퇴할까요?",
      en: "Delete this creator account?",
    },
    exposure: {
      ko: "탈퇴가 완료되면 로그인과 크리에이터 계정의 공개 노출이 즉시 차단됩니다.",
      en: "Once deletion is complete, sign-in and public exposure of the creator account are blocked immediately.",
    },
    campaignLink: { ko: "내 캠페인 현황 확인", en: "Review my campaign status" },
  },
} as const;

interface AccountDeletionProps {
  scope: AccountScope;
}

export default function AccountDeletion({ scope }: AccountDeletionProps) {
  const { t } = useLang();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const config = ACCOUNT_CONFIG[scope];
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<DeleteError>(null);
  const sectionTitleId = useId();
  const dialogTitleId = useId();
  const descriptionId = useId();
  const confirmationId = useId();

  const closeDialog = () => {
    if (deleting) return;
    setOpen(false);
    setConfirmed(false);
    setDeleteError(null);
  };

  const dialogRef = useDialogA11y<HTMLDivElement>(open, closeDialog);

  const handleDelete = async () => {
    if (!confirmed || deleting) return;

    setDeleteError(null);
    setDeleting(true);
    try {
      await api.delete(config.endpoint);
      await removeTokens();
      logout();
      router.replace(config.successHref);
      router.refresh();
    } catch (error: unknown) {
      const response =
        typeof error === "object" && error !== null && "response" in error
          ? (error as {
              response?: { status?: number; data?: { code?: string } };
            }).response
          : undefined;

      if (
        response?.status === 409 &&
        response.data?.code === "ACCOUNT_HAS_ACTIVE_CAMPAIGN"
      ) {
        setDeleteError("ACTIVE_CAMPAIGN");
      } else {
        setDeleteError("REQUEST_FAILED");
      }
      setDeleting(false);
    }
  };

  return (
    <section
      className="mt-12 border-t-2 border-foreground pt-6"
      aria-labelledby={sectionTitleId}
    >
      <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="max-w-xl">
          <h2
            id={sectionTitleId}
            className="text-xl font-bold tracking-tight text-foreground"
          >
            {t("계정 탈퇴", "Delete account")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t(config.sectionDescription.ko, config.sectionDescription.en)}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setOpen(true)}
          className="min-h-11 shrink-0 !border-error/50 !text-error hover:!border-error hover:!text-error"
        >
          {t(config.trigger.ko, config.trigger.en)}
        </Button>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4"
            onClick={closeDialog}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              aria-describedby={descriptionId}
              aria-busy={deleting}
              tabIndex={-1}
              className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl md:p-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-6">
                <h2
                  id={dialogTitleId}
                  className="text-2xl font-bold tracking-tight text-foreground"
                >
                  {t(config.dialogTitle.ko, config.dialogTitle.en)}
                </h2>
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={deleting}
                  aria-label={t(
                    "탈퇴 확인 닫기",
                    "Close account deletion confirmation",
                  )}
                  className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div
                id={descriptionId}
                className="mt-5 border-y border-line text-sm leading-relaxed text-content-soft"
              >
                <p className="py-3">{t(config.exposure.ko, config.exposure.en)}</p>
                <p className="border-t border-line py-3">
                  {t(
                    "거래·법적 증적은 관련 법령 및 승인된 보존기간 동안 제한적으로 보관됩니다.",
                    "Transaction and legal evidence is retained only for the applicable legal and approved retention periods.",
                  )}
                </p>
                <p className="border-t border-line py-3">
                  {t(
                    "진행 중인 캠페인 또는 미정산 건이 있으면 탈퇴할 수 없습니다.",
                    "The account cannot be deleted while a campaign is active or an item remains unsettled.",
                  )}
                </p>
              </div>

              <label
                htmlFor={confirmationId}
                className="mt-5 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl bg-surface-muted p-4 text-sm font-medium leading-relaxed text-foreground"
              >
                <input
                  id={confirmationId}
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  disabled={deleting}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                />
                <span>
                  {t(
                    "즉시 접근·공개 노출이 차단되고, 필요한 증적은 보존기간 동안 보관됨을 확인했습니다.",
                    "I understand that access and public exposure stop immediately and required evidence remains for its retention period.",
                  )}
                </span>
              </label>

              {deleteError === "ACTIVE_CAMPAIGN" && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl bg-error/10 p-4 text-sm leading-relaxed text-error"
                >
                  <p className="font-semibold">
                    {t(
                      "진행 중인 캠페인 또는 미정산 건이 있어 탈퇴할 수 없습니다.",
                      "This account has an active campaign or unsettled item and cannot be deleted yet.",
                    )}
                  </p>
                  <Link
                    href={config.campaignHref}
                    className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                    onClick={closeDialog}
                  >
                    {t(config.campaignLink.ko, config.campaignLink.en)}
                  </Link>
                </div>
              )}

              {deleteError === "REQUEST_FAILED" && (
                <p role="alert" className="mt-4 text-sm leading-relaxed text-error">
                  {t(
                    "계정 탈퇴 요청을 완료하지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해주세요.",
                    "We couldn't complete the account deletion request. Check your connection and try again.",
                  )}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDialog}
                  disabled={deleting}
                  className="min-h-11"
                >
                  {t("취소", "Cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={!confirmed || deleting}
                  className="min-h-11 !bg-error !text-white hover:!bg-error/90"
                >
                  {deleting
                    ? t("계정 탈퇴 중...", "Deleting account...")
                    : deleteError
                      ? t("다시 시도", "Try again")
                      : t("계정 탈퇴", "Delete account")}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
