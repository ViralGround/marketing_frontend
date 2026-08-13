"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  CircleUserRound,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { removeTokens } from "@/lib/auth";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { useLang } from "@/lib/i18n";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types";
import styles from "./WorkspaceShell.module.css";

type WorkspaceRole = Extract<UserRole, "COMPANY" | "CREATOR">;

type NavItem = {
  href: string;
  labelKo: string;
  labelEn: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV: Record<WorkspaceRole, NavItem[]> = {
  COMPANY: [
    { href: "/company/dashboard", labelKo: "대시보드", labelEn: "Dashboard", icon: LayoutDashboard },
    { href: "/company/campaigns", labelKo: "캠페인", labelEn: "Campaigns", icon: BriefcaseBusiness },
    { href: "/company/campaigns/new", labelKo: "캠페인 등록", labelEn: "Create campaign", icon: FilePlus2, exact: true },
    { href: "/company/profile", labelKo: "기업 프로필", labelEn: "Company profile", icon: Settings2 },
  ],
  CREATOR: [
    { href: "/creator/dashboard", labelKo: "대시보드", labelEn: "Dashboard", icon: LayoutDashboard },
    { href: "/creator/home", labelKo: "캠페인 찾기", labelEn: "Discover", icon: Search },
    { href: "/creator/mypage", labelKo: "지원·콘텐츠", labelEn: "Applications", icon: BriefcaseBusiness },
    { href: "/creator/performance", labelKo: "성과 기록", labelEn: "Performance", icon: BarChart3 },
    { href: "/profile/setup", labelKo: "내 프로필", labelEn: "My profile", icon: CircleUserRound },
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
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useDialogA11y<HTMLElement>(menuOpen, () => setMenuOpen(false));
  const roleLabel = role === "COMPANY" ? t("기업", "Company") : t("크리에이터", "Creator");

  const handleLogout = async () => {
    await removeTokens();
    logout();
    router.replace("/login");
    router.refresh();
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    const base = role === "COMPANY" ? "/company/campaigns" : "/creator/home";
    router.push(q ? `${base}?search=${encodeURIComponent(q)}` : base);
  };

  const sidebar = (
    <>
      {menuOpen && (
        <button type="button" aria-label={t("메뉴 닫기", "Close menu")} className={styles.backdrop} onClick={() => setMenuOpen(false)} />
      )}
      <aside
        ref={dialogRef}
        tabIndex={menuOpen ? -1 : undefined}
        aria-label={t(`${roleLabel} 워크스페이스 메뉴`, `${roleLabel} workspace menu`)}
        aria-modal={menuOpen || undefined}
        role={menuOpen ? "dialog" : undefined}
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
      >
        <Link href={role === "COMPANY" ? "/company/dashboard" : "/creator/dashboard"} className={styles.brandBlock} onClick={() => setMenuOpen(false)}>
          <span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/viral-ground-mark.png" alt="" aria-hidden="true" />
            <span>VIRAL GROUND</span>
          </span>
        </Link>
        <nav className={styles.nav} aria-label={t("주요 메뉴", "Primary navigation")}>
          {NAV[role].map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`} onClick={() => setMenuOpen(false)}>
                <Icon className={styles.navIcon} strokeWidth={1.8} aria-hidden="true" />
                {t(item.labelKo, item.labelEn)}
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFoot}>
          <div className={styles.statusCard}>
            <strong>MANAGED BETA</strong>
            <p>{t("결제·정산은 운영 계약과 PG 연결 후 활성화됩니다.", "Payments activate after the operating contract and gateway are ready.")}</p>
          </div>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            <LogOut className={styles.navIcon} strokeWidth={1.8} aria-hidden="true" />
            {t("로그아웃", "Log out")}
          </button>
        </div>
      </aside>
    </>
  );

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarStart}>
          <button type="button" className={styles.menuButton} aria-label={menuOpen ? t("메뉴 닫기", "Close menu") : t("메뉴 열기", "Open menu")} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <div className={styles.roleSwitch}>
            <span className={styles.roleName}>{roleLabel}</span>
            <span className={styles.roleContext}>VIRAL GROUND</span>
          </div>
        </div>
        <Link href={role === "COMPANY" ? "/company/dashboard" : "/creator/dashboard"} className={styles.topLogo} aria-label="Viral Ground dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/viral-ground-mark.png" alt="" aria-hidden="true" />
        </Link>
        <div className={styles.topbarEnd}>
          <form className={styles.searchForm} role="search" onSubmit={handleSearch}>
            <Search className={styles.searchIcon} aria-hidden="true" strokeWidth={2} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("캠페인, 브랜드 검색", "Search campaigns, brands")}
              aria-label={t("캠페인 검색", "Search campaigns")}
            />
          </form>
          <span className={styles.beta}>MANAGED BETA</span>
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">{user?.name?.trim().slice(0, 1) || "V"}</span>
            <span className={styles.profileCopy}>
              <span className={styles.profileName}>{user?.name ?? roleLabel}</span>
              <span className={styles.profileRole}>{role}</span>
            </span>
          </div>
        </div>
      </header>
      <div className={styles.body}>
        {typeof document !== "undefined" && createPortal(sidebar, document.body)}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
