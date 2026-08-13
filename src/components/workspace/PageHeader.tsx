import type { ReactNode } from "react";
import styles from "./Dashboard.module.css";

/**
 * 워크스페이스 내부 페이지 공용 헤더 — 대시보드 타이틀(Archivo 디스플레이)의 소형판.
 * display: 영문 디스플레이 한 줄(예: "DISCOVER"), subtitle: 한국어 설명,
 * action: 우측 버튼/링크 슬롯.
 */
export default function PageHeader({
  display,
  subtitle,
  action,
}: {
  display: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{display}</h1>
        {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
      </div>
      {action && <div className={styles.pageAction}>{action}</div>}
    </header>
  );
}
