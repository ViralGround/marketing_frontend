"use client";

import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import styles from "./PublicGround.module.css";

export { styles as groundStyles };

interface GroundRailItem {
  id: string;
  label: string;
}

export function PublicGroundFrame({
  children,
  sections,
  mobileDock,
  className = "",
}: {
  children: ReactNode;
  sections: GroundRailItem[];
  mobileDock?: ReactNode;
  className?: string;
}) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-24% 0px -58%", threshold: [0, 0.2, 0.55] },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className={`${styles.page} ${className}`.trim()}>
      <GroundTopbar />
      <nav className={styles.sectionRail} aria-label="페이지 섹션">
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-label={`${String(index + 1).padStart(2, "0")} ${section.label}`}
            aria-current={activeSection === section.id ? "location" : undefined}
          >
            {String(index + 1).padStart(2, "0")}
          </a>
        ))}
      </nav>
      <div className={styles.main}>{children}</div>
      {mobileDock && <div className={styles.mobileDock}>{mobileDock}</div>}
      <GroundFooter />
    </div>
  );
}

export function GroundHero({
  id,
  title,
  description,
  actions,
  media,
  corner,
  profile = false,
}: {
  id: string;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
  media: ReactNode;
  corner: string;
  profile?: boolean;
}) {
  return (
    <section id={id} className={`${styles.hero} ${profile ? styles.profileHero : ""}`.trim()}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroDescription}>{description}</p>
          {actions && <div className={styles.heroActions}>{actions}</div>}
        </div>
        <div className={styles.heroMedia}>{media}</div>
        <span className={styles.heroCorner} aria-hidden="true">{corner}</span>
      </div>
    </section>
  );
}

export function GroundAccent({ children }: { children: ReactNode }) {
  return <span className={styles.heroTitleAccent}>{children}</span>;
}

export function GroundActionLink({
  children,
  tone = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & {
  tone?: "primary" | "secondary" | "onDark";
}) {
  const toneClass = tone === "primary" ? styles.actionPrimary : tone === "onDark" ? styles.actionOnDark : styles.actionSecondary;
  return (
    <Link {...props} className={`${toneClass} ${className}`.trim()}>
      {children}
      <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />
    </Link>
  );
}

export function GroundActionButton({
  children,
  tone = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "onDark";
}) {
  const toneClass = tone === "primary" ? styles.actionPrimary : tone === "onDark" ? styles.actionOnDark : styles.actionSecondary;
  return (
    <button {...props} type={props.type ?? "button"} className={`${toneClass} ${className}`.trim()}>
      {children}
      <ArrowRight aria-hidden="true" size={17} strokeWidth={2.5} />
    </button>
  );
}

export function GroundDockLink({
  children,
  secondary = false,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { secondary?: boolean }) {
  return (
    <Link
      {...props}
      className={`${styles.dockAction} ${secondary ? styles.dockSecondary : ""} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}

export function GroundMetricStrip({
  items,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
}) {
  return (
    <dl
      className={styles.metricStrip}
      style={{ "--metric-count": items.length } as CSSProperties}
    >
      {items.map((item, index) => (
        <div key={index} className={styles.metricItem}>
          <dt className={styles.metricLabel}>{item.label}</dt>
          <dd className={styles.metricValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function GroundSection({
  id,
  title,
  description,
  children,
  tone = "paper",
}: {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  tone?: "paper" | "violet" | "ink";
}) {
  const toneClass = tone === "violet" ? styles.sectionViolet : tone === "ink" ? styles.sectionInk : styles.sectionPaper;
  return (
    <section id={id} className={`${styles.section} ${toneClass}`}>
      <div className={styles.sectionInner}>
        <header className={styles.sectionIntro}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {description && <p className={styles.sectionDescription}>{description}</p>}
        </header>
        <div className={styles.sectionContent}>{children}</div>
      </div>
    </section>
  );
}

export function GroundState({
  title,
  description,
  action,
  loading = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
}) {
  return (
    <div className={styles.statePanel} aria-live={loading ? "polite" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/workspace-art/ground-mist.webp" alt="" aria-hidden="true" loading="lazy" />
      <div className={styles.stateContent}>
        <h2 className={styles.stateTitle}>{title}</h2>
        {description && <p className={styles.stateDescription}>{description}</p>}
        {action}
      </div>
      {loading && <span className={styles.loadingLine} aria-hidden="true" />}
    </div>
  );
}

export function GroundFinalBand({
  id,
  title,
  description,
  actions,
}: {
  id: string;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
}) {
  return (
    <section id={id} className={styles.finalBand}>
      <div className={styles.finalInner}>
        <div>
          <h2 className={styles.finalTitle}>{title}</h2>
          <p className={styles.finalDescription}>{description}</p>
        </div>
        <div className={styles.finalActions}>{actions}</div>
      </div>
    </section>
  );
}
