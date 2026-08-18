"use client";

import {
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import GroundTopbar from "@/components/landing/onevideo/GroundTopbar";
import GroundFooter from "@/components/landing/onevideo/GroundFooter";
import styles from "./CallSheet.module.css";

export { styles as callStyles };

export type SceneTone = "paper" | "violet" | "ink";

export interface CallSceneDefinition {
  id: string;
  label: string;
  tone: SceneTone;
}

interface FilmFrame {
  src: string;
  alt: string;
  label: string;
}

export function CallSheetFrame({
  children,
  sections,
  filmFrames,
  dock,
  pageName,
  quietFilm,
  filmScenes,
}: {
  children: ReactNode;
  sections: CallSceneDefinition[];
  filmFrames: FilmFrame[];
  dock?: ReactNode;
  pageName: string;
  /** 필름 스트립이 내용을 가리면 안 되는 씬 id — 해당 씬에서 스트립을 물러나게 한다. */
  quietFilm?: string[];
  /**
   * 필름을 보여줄 씬 id 목록. 지정하면 그 밖의 모든 씬에서 스트립이 물러난다.
   * 기본 용법은 히어로 한 씬만 넘기는 것 — 필름은 브랜드 실이고 페이지의 주인공이 아니다.
   */
  filmScenes?: string[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const pageRef = useRef<HTMLDivElement>(null);
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));
  const activeTone = sections[activeIndex]?.tone ?? "paper";

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((target): target is HTMLElement => Boolean(target));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (current?.target.id) setActiveId(current.target.id);
      },
      { rootMargin: "-28% 0px -58%", threshold: [0, 0.12, 0.38] },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const distance = Math.max(1, root.scrollHeight - window.innerHeight);
      page.style.setProperty("--call-progress", String(Math.min(1, Math.max(0, window.scrollY / distance))));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className={styles.page}
      data-scene={activeIndex + 1}
      data-tone={activeTone}
      data-film={
        (filmScenes ? !filmScenes.includes(activeId) : quietFilm?.includes(activeId))
          ? "quiet"
          : undefined
      }
      style={{ "--scene-index": activeIndex } as CSSProperties}
    >
      <GroundTopbar tone={activeTone === "ink" ? "dark" : "paper"} />

      <nav className={styles.sceneRail} aria-label={`${pageName} 페이지 진행`}>
        <span className={styles.sceneRailTrack} aria-hidden="true">
          <span style={{ "--rail-fill": (activeIndex + 1) / Math.max(1, sections.length) } as CSSProperties} />
        </span>
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={section.id === activeId ? "location" : undefined}
            aria-label={`${String(index + 1).padStart(2, "0")} ${section.label}`}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.sceneRailLabel} aria-hidden="true">{section.label}</span>
          </a>
        ))}
      </nav>

      <aside className={styles.takeStrip} aria-label="콘텐츠 예시 필름">
        <span className={styles.takePerforation} aria-hidden="true" />
        <div className={styles.takeFrames}>
          {filmFrames.slice(0, 3).map((item, index) => (
            <figure key={`${item.src}-${index}`} className={styles.takeFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.alt} loading={index === 0 ? "eager" : "lazy"} />
              <figcaption>
                <span>TAKE {String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
              </figcaption>
            </figure>
          ))}
        </div>
        <span className={styles.takeEdgeLabel}>CONTENT EXAMPLE / NOT PERFORMANCE DATA</span>
      </aside>

      <main className={`${styles.main}${dock ? ` ${styles.dockPad}` : ""}`}>{children}</main>
      {dock ? <div className={styles.mobileDock}>{dock}</div> : null}
      <GroundFooter />
    </div>
  );
}

export function CallScene({
  id,
  tone,
  children,
  className = "",
}: {
  id: string;
  tone: SceneTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${styles.scene} ${styles[`scene${tone[0].toUpperCase()}${tone.slice(1)}`]} ${className}`.trim()}>
      {children}
    </section>
  );
}

export function CallActionLink({
  tone = "primary",
  children,
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  tone?: "primary" | "secondary" | "light";
}) {
  return (
    <Link {...props} href={props.href} className={`${styles.action} ${styles[`action${tone[0].toUpperCase()}${tone.slice(1)}`]} ${className}`.trim()}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}

export function CallActionButton({
  tone = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "light";
}) {
  return (
    <button {...props} type={props.type ?? "button"} className={`${styles.action} ${styles[`action${tone[0].toUpperCase()}${tone.slice(1)}`]} ${className}`.trim()}>
      <span>{children}</span>
      <ArrowRight aria-hidden="true" />
    </button>
  );
}

export function CallDockLink({
  children,
  secondary = false,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; secondary?: boolean }) {
  return (
    <Link {...props} href={props.href} className={`${styles.dockAction} ${secondary ? styles.dockSecondary : ""}`.trim()}>
      {children}
    </Link>
  );
}

export function CallDockButton({
  children,
  secondary = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button {...props} type={props.type ?? "button"} className={`${styles.dockAction} ${secondary ? styles.dockSecondary : ""}`.trim()}>
      {children}
    </button>
  );
}

export function CallSheetDocument({
  title,
  status,
  fields,
  footer,
}: {
  title: string;
  status: string;
  fields: Array<{ label: string; value: ReactNode }>;
  footer: ReactNode;
}) {
  return (
    <div className={styles.callSheetDocument}>
      <header>
        <span>VG / LIVE PRODUCTION</span>
        <strong>{status}</strong>
      </header>
      <h2>{title}</h2>
      <dl>
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
      <footer>{footer}</footer>
    </div>
  );
}

export function CallHero({
  id,
  pageCode,
  lines,
  description,
  actions,
  document,
}: {
  id: string;
  pageCode: string;
  lines: string[];
  description: ReactNode;
  actions: ReactNode;
  document: ReactNode;
}) {
  return (
    <CallScene id={id} tone="paper" className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroTitleWrap}>
          <h1 className={styles.heroTitle}>
            {lines.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}
          </h1>
          <span className={styles.heroPageCode}>{pageCode}</span>
        </div>
        <div className={styles.heroOffer}>
          <p>{description}</p>
          <div className={styles.heroActions}>{actions}</div>
        </div>
        <div className={styles.heroDocument}>{document}</div>
        <div className={styles.heroCutLine} aria-hidden="true">
          <span>SCENE 01</span>
          <span>ROLL / 2026</span>
        </div>
      </div>
    </CallScene>
  );
}

export function CallReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    setReady(true);
    const initiallyVisible = node.getBoundingClientRect().top < window.innerHeight * 0.92;
    setVisible(initiallyVisible);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${ready ? styles.revealReady : ""} ${visible ? styles.revealVisible : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function CallSceneHeading({
  title,
  accent,
  description,
}: {
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <header className={styles.sceneHeading}>
      <h2>{title}{accent ? <span>{accent}</span> : null}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

export function CallRuleList({
  items,
}: {
  items: Array<{ code: string; title: ReactNode; body: ReactNode; meta?: ReactNode }>;
}) {
  return (
    <ol className={styles.ruleList}>
      {items.map((item) => (
        <li key={item.code}>
          <span className={styles.ruleCode}>{item.code}</span>
          <span className={styles.ruleCopy}>
            <strong>{item.title}</strong>
            <small>{item.body}</small>
          </span>
          <span className={styles.ruleMeta}>{item.meta ?? <ArrowUpRight aria-hidden="true" />}</span>
        </li>
      ))}
    </ol>
  );
}

export function ProductPreviewLabel({ children = "PRODUCT PREVIEW / SAMPLE STATE" }: { children?: ReactNode }) {
  return <span className={styles.previewLabel}>{children}</span>;
}
