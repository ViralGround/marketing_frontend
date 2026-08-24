"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  FilePlus2,
  Globe2,
  Inbox,
  Landmark,
  LayoutDashboard,
  LogOut,
  Search,
  ScrollText,
  Settings2,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { removeTokens } from "@/lib/auth";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { useLang } from "@/lib/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import { FEATURE_INSTAGRAM_ENABLED, FEATURE_PAYMENTS_ENABLED } from "@/lib/featureFlags";
import { clearGaUser } from "@/lib/gtag";
import type { UserRole } from "@/types";
import styles from "./WorkspaceShell.module.css";

type WorkspaceRole = UserRole;

type NavItem = {
  href: string;
  labelKo: string;
  labelEn: string;
  shortKo?: string;
  shortEn?: string;
  icon: LucideIcon;
  exact?: boolean;
};

const SIDEBAR_KEY = "vg-workspace-sidebar-collapsed";
const SIDEBAR_EVENT = "vg-workspace-sidebar-change";

function subscribeSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_EVENT, callback);
  };
}

function getSidebarSnapshot() {
  return window.localStorage.getItem(SIDEBAR_KEY) === "true";
}

const NAV: Record<WorkspaceRole, NavItem[]> = {
  COMPANY: [
    { href: "/company/dashboard", labelKo: "대시보드", labelEn: "Dashboard", shortKo: "홈", shortEn: "Home", icon: LayoutDashboard },
    { href: "/company/campaigns", labelKo: "캠페인", labelEn: "Campaigns", icon: BriefcaseBusiness },
    { href: "/company/campaigns/new", labelKo: "캠페인 등록", labelEn: "Create campaign", shortKo: "등록", shortEn: "Create", icon: FilePlus2, exact: true },
    { href: "/company/profile", labelKo: "브랜드 설정", labelEn: "Brand settings", shortKo: "설정", shortEn: "Settings", icon: Settings2 },
  ],
  CREATOR: [
    { href: "/creator/dashboard", labelKo: "대시보드", labelEn: "Dashboard", shortKo: "홈", shortEn: "Home", icon: LayoutDashboard },
    { href: "/creator/home", labelKo: "캠페인 찾기", labelEn: "Discover", shortKo: "탐색", shortEn: "Discover", icon: Search },
    { href: "/creator/mypage", labelKo: "지원·콘텐츠", labelEn: "Applications", shortKo: "작업", shortEn: "Work", icon: BriefcaseBusiness },
    { href: "/creator/performance", labelKo: "성과 기록", labelEn: "Performance", shortKo: "성과", shortEn: "Results", icon: BarChart3 },
    { href: "/creator/profile", labelKo: "내 프로필", labelEn: "My profile", shortKo: "프로필", shortEn: "Profile", icon: CircleUserRound },
  ],
  ADMIN: [
    { href: "/admin/dashboard", labelKo: "대시보드", labelEn: "Dashboard", shortKo: "홈", shortEn: "Home", icon: LayoutDashboard },
    { href: "/admin/members", labelKo: "회원 관리", labelEn: "Members", shortKo: "회원", shortEn: "Members", icon: UsersRound },
    { href: "/admin/campaigns", labelKo: "캠페인 관리", labelEn: "Campaigns", shortKo: "캠페인", shortEn: "Camps", icon: BriefcaseBusiness },
    { href: "/admin/analytics", labelKo: "릴스 분석", labelEn: "Reel analytics", shortKo: "분석", shortEn: "Reels", icon: BarChart3 },
    { href: "/admin/escrow", labelKo: "예치금 확인", labelEn: "Deposits", shortKo: "예치", shortEn: "Deposits", icon: Landmark },
    { href: "/admin/contacts", labelKo: "상담 신청", labelEn: "Consultations", shortKo: "상담", shortEn: "Inbox", icon: Inbox },
    { href: "/admin/audit-logs", labelKo: "감사로그", labelEn: "Audit logs", shortKo: "감사", shortEn: "Audit", icon: ScrollText },
  ],
};

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  if (item.href === "/company/campaigns") {
    return pathname === item.href || (pathname.startsWith(`${item.href}/`) && pathname !== "/company/campaigns/new");
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function WorkspaceShell({ role, children }: { role: WorkspaceRole; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { lang, setLang, t } = useLang();
  const sidebarCollapsed = useSyncExternalStore(subscribeSidebar, getSidebarSnapshot, () => false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const searchDialogRef = useDialogA11y<HTMLElement>(searchOpen, () => setSearchOpen(false));
  const accountDialogRef = useDialogA11y<HTMLElement>(accountOpen, () => setAccountOpen(false));
  const roleLabel =
    role === "COMPANY" ? t("브랜드", "Brand")
    : role === "ADMIN" ? t("관리자", "Admin")
    : t("크리에이터", "Creator");
  const dashboardHref =
    role === "COMPANY" ? "/company/dashboard"
    : role === "ADMIN" ? "/admin/dashboard"
    : "/creator/dashboard";
  // 관리자 목록 페이지들은 검색 파라미터를 받지 않으므로 검색 UI 자체를 숨긴다(가짜 어포던스 방지).
  const searchEnabled = role !== "ADMIN";
  const navItems = NAV[role].filter((item) => {
    if (!FEATURE_PAYMENTS_ENABLED && item.href === "/admin/escrow") return false;
    if (!FEATURE_INSTAGRAM_ENABLED && item.href === "/admin/analytics") return false;
    return true;
  });

  const toggleSidebar = () => {
    window.localStorage.setItem(SIDEBAR_KEY, String(!sidebarCollapsed));
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await removeTokens();
      clearGaUser();
      logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError(
        t(
          "로그아웃을 완료하지 못했습니다. 연결을 확인한 뒤 다시 시도해주세요.",
          "We couldn't complete logout. Check your connection and try again.",
        ),
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    const base =
      role === "COMPANY" ? "/company/campaigns"
      : role === "ADMIN" ? "/admin/campaigns"
      : "/creator/home";
    setSearchOpen(false);
    router.push(q ? `${base}?search=${encodeURIComponent(q)}` : base);
  };

  const openAccount = () => {
    setSearchOpen(false);
    setAccountOpen(true);
  };

  const overlay = (searchOpen || accountOpen) && typeof document !== "undefined" ? createPortal(
    <div className={styles.overlayRoot}>
      <button
        type="button"
        className={styles.overlayBackdrop}
        aria-label={t("패널 닫기", "Close panel")}
        onClick={() => {
          setSearchOpen(false);
          setAccountOpen(false);
        }}
      />
      {searchOpen && (
        <section ref={searchDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="workspace-search-title" className={styles.searchPanel}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.panelArt} src="/workspace-art/hero-smoke.webp" alt="" aria-hidden="true" loading="lazy" />
          <header className={styles.overlayHead}>
            <div>
              <span className={styles.overlayIndex}>SEARCH / 01</span>
              <h2 id="workspace-search-title">{t("워크스페이스 검색", "Workspace search")}</h2>
            </div>
            <button type="button" className={styles.iconButton} aria-label={t("검색 닫기", "Close search")} onClick={() => setSearchOpen(false)}><X aria-hidden="true" /></button>
          </header>
          <form className={styles.overlaySearchForm} role="search" onSubmit={handleSearch}>
            <Search aria-hidden="true" />
            <input
              data-dialog-initial-focus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("캠페인 또는 브랜드 이름", "Campaign or brand name")}
              aria-label={t("캠페인 검색", "Search campaigns")}
            />
            <button type="submit">{t("검색", "Search")}</button>
          </form>
          <nav className={styles.quickLinks} aria-label={t("빠른 이동", "Quick navigation")}>
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={() => setSearchOpen(false)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{t(item.labelKo, item.labelEn)}</strong>
                <ChevronRight aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </section>
      )}
      {accountOpen && (
        <section ref={accountDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="workspace-account-title" className={styles.accountSheet}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.sheetArt} src="/workspace-art/smoke-wisp.webp" alt="" aria-hidden="true" loading="lazy" />
          <header className={styles.overlayHead}>
            <div>
              <span className={styles.overlayIndex}>ACCOUNT / 02</span>
              <h2 id="workspace-account-title">{user?.name ?? roleLabel}</h2>
            </div>
            <button type="button" className={styles.iconButton} aria-label={t("계정 닫기", "Close account")} onClick={() => setAccountOpen(false)}><X aria-hidden="true" /></button>
          </header>
          <div className={styles.accountBody}>
            <div className={styles.accountRow}>
              <span><Globe2 aria-hidden="true" />{t("언어", "Language")}</span>
              <div className={styles.languageSwitch} role="group" aria-label={t("언어 선택", "Choose language")}>
                <button type="button" aria-pressed={lang === "ko"} onClick={() => setLang("ko")}>KO</button>
                <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>EN</button>
              </div>
            </div>
            <div className={styles.betaNote}>
              <strong>MANAGED BETA</strong>
              <p>{t("현재 서비스에서는 결제·에스크로·정산을 처리하지 않습니다.", "This service does not process payments, escrow, or settlements.")}</p>
            </div>
            {role !== "ADMIN" && (
              <Link className={styles.accountLink} href={role === "COMPANY" ? "/company/profile" : "/creator/profile"} onClick={() => setAccountOpen(false)}>
                <Settings2 aria-hidden="true" />
                <span>{t("프로필과 계정 관리", "Profile and account")}</span>
                <ChevronRight aria-hidden="true" />
              </Link>
            )}
          </div>
          {logoutError && <p role="alert" className={styles.logoutError}>{logoutError}</p>}
          <footer className={styles.accountActions}>
            <button type="button" onClick={handleLogout} disabled={loggingOut} aria-busy={loggingOut}><LogOut aria-hidden="true" />{loggingOut ? t("로그아웃 중...", "Logging out...") : t("로그아웃", "Log out")}</button>
          </footer>
        </section>
      )}
    </div>,
    document.body,
  ) : null;

  return (
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.shellCollapsed : ""}`}>
      <header className={styles.topbar}>
        <div className={styles.topbarStart}>
          <span className={styles.roleName}>{roleLabel}</span>
          <span className={styles.roleContext}>WORKSPACE</span>
        </div>
        <Link href={dashboardHref} className={styles.topLogo} aria-label={t("Viral Ground 대시보드", "Viral Ground dashboard")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/viral-ground-mark.png" alt="" aria-hidden="true" />
          <span>VIRAL GROUND</span>
        </Link>
        <div className={styles.topbarEnd}>
          {searchEnabled && (
            <>
              <form className={styles.searchForm} role="search" onSubmit={handleSearch}>
                <Search className={styles.searchIcon} aria-hidden="true" strokeWidth={1.8} />
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("캠페인 검색", "Search campaigns")} aria-label={t("캠페인 검색", "Search campaigns")} />
              </form>
              <button type="button" className={`${styles.topAction} ${styles.mobileSearchButton}`} aria-label={t("검색 열기", "Open search")} onClick={() => setSearchOpen(true)}><Search aria-hidden="true" /></button>
            </>
          )}
          <button type="button" className={styles.accountButton} aria-label={t("계정 메뉴 열기", "Open account menu")} aria-expanded={accountOpen} onClick={openAccount}>
            <span className={styles.avatar} aria-hidden="true">{user?.name?.trim().slice(0, 1) || "V"}</span>
            <span className={styles.profileCopy}>
              <span className={styles.profileName}>{user?.name ?? roleLabel}</span>
              <span className={styles.profileRole}>{role === "ADMIN" ? "OPERATIONS" : "MANAGED BETA"}</span>
            </span>
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <aside aria-label={t(`${roleLabel} 워크스페이스 메뉴`, `${roleLabel} workspace menu`)} className={styles.sidebar}>
          <nav className={styles.nav} aria-label={t("주요 메뉴", "Primary navigation")}>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(pathname, item);
              return (
                <Link key={item.href} href={item.href} title={sidebarCollapsed ? t(item.labelKo, item.labelEn) : undefined} aria-current={active ? "page" : undefined} className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}>
                  <span className={styles.navIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <Icon className={styles.navIcon} strokeWidth={1.8} aria-hidden="true" />
                  <span className={styles.navLabel}>{t(item.labelKo, item.labelEn)}</span>
                </Link>
              );
            })}
          </nav>
          <div className={styles.sidebarFoot}>
            <button type="button" className={styles.collapseButton} aria-label={sidebarCollapsed ? t("사이드바 펼치기", "Expand sidebar") : t("사이드바 접기", "Collapse sidebar")} aria-pressed={sidebarCollapsed} onClick={toggleSidebar}>
              {sidebarCollapsed ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
              <span>{t("메뉴 접기", "Collapse")}</span>
            </button>
          </div>
        </aside>
        <div className={styles.content}>{children}</div>
      </div>

      <nav className={styles.bottomNav} aria-label={t("모바일 주요 메뉴", "Mobile primary navigation")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? styles.bottomNavActive : ""}>
              <Icon aria-hidden="true" strokeWidth={active ? 2.2 : 1.7} />
              <span>{t(item.shortKo ?? item.labelKo, item.shortEn ?? item.labelEn)}</span>
            </Link>
          );
        })}
      </nav>
      {overlay}
    </div>
  );
}
