"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, Minus, Plus, X, type LucideIcon } from "lucide-react";
import { useId, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import styles from "./WorkspacePrimitives.module.css";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type PageSize = "compact" | "standard" | "wide" | "form";

const PAGE_SIZE: Record<PageSize, string> = {
  compact: styles.pageCompact,
  standard: styles.pageStandard,
  wide: styles.pageWide,
  form: styles.pageForm,
};

export function WorkspacePage({
  size = "standard",
  flow = true,
  className,
  children,
}: {
  size?: PageSize;
  flow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx(styles.page, PAGE_SIZE[size], flow && styles.flow, className)}>{children}</div>;
}

export function WorkspaceStage({
  header,
  children,
  footer,
  className,
}: {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(styles.stage, className)}>
      {header && <div className={styles.stageHeader}>{header}</div>}
      <div className={styles.stageBody}>{children}</div>
      {footer && <div className={styles.stageFooter}>{footer}</div>}
    </div>
  );
}

export function WorkspaceScrollArea({
  children,
  className,
  padded = false,
  label,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  label?: string;
}) {
  return (
    <div className={cx(styles.scrollArea, padded && styles.scrollAreaPadded, className)} tabIndex={0} role="region" aria-label={label}>
      {children}
    </div>
  );
}

export function WorkspaceTabs<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  groupId = "workspace",
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: ReactNode; count?: number }>;
  onChange: (value: T) => void;
  className?: string;
  groupId?: string;
}) {
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    onChange(options[next].value);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role='tab']")[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={cx(styles.tabs, className)}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            id={`${groupId}-tab-${option.value}`}
            type="button"
            role="tab"
            tabIndex={selected ? 0 : -1}
            aria-selected={selected}
            aria-controls={`${groupId}-panel-${option.value}`}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => move(event, index)}
          >
            <span>{option.label}</span>
            {typeof option.count === "number" && <small>{option.count}</small>}
          </button>
        );
      })}
    </div>
  );
}

export function WorkspaceTabPanel({
  value,
  activeValue,
  children,
  className,
  groupId = "workspace",
}: {
  value: string;
  activeValue: string;
  children: ReactNode;
  className?: string;
  groupId?: string;
}) {
  const active = value === activeValue;
  return <div id={`${groupId}-panel-${value}`} role="tabpanel" aria-labelledby={`${groupId}-tab-${value}`} tabIndex={active ? 0 : -1} hidden={!active} className={cx(styles.tabPanel, className)}>{children}</div>;
}

export function MetricStrip({
  items,
  label,
  className,
}: {
  items: Array<{ label: ReactNode; value: ReactNode; hint?: ReactNode; tone?: "default" | "accent" | "warning" }>;
  label: string;
  className?: string;
}) {
  return (
    <dl aria-label={label} className={cx(styles.metricStrip, className)} style={{ "--metric-count": items.length } as CSSProperties}>
      {items.map((item, index) => (
        <div key={index} className={cx(styles.metricItem, item.tone === "accent" && styles.metricAccent, item.tone === "warning" && styles.metricWarning)}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
          {item.hint && <span>{item.hint}</span>}
        </div>
      ))}
    </dl>
  );
}

export function ResponsiveSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  label,
  size = "standard",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  label: string;
  size?: "compact" | "standard";
}) {
  const titleId = useId();
  const dialogRef = useDialogA11y<HTMLElement>(open, onClose);
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.sheetRoot}>
      <button type="button" className={styles.sheetBackdrop} aria-label={label} onClick={onClose} />
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className={cx(styles.sheet, styles[`sheet${size[0].toUpperCase()}${size.slice(1)}`])}>
        <header className={styles.sheetHeader}>
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className={styles.sheetClose} aria-label={label} onClick={onClose}><X aria-hidden="true" /></button>
        </header>
        <div className={styles.sheetBody}>{children}</div>
        {footer && <footer className={styles.sheetFooter}>{footer}</footer>}
      </section>
    </div>,
    document.body,
  );
}

type PanelTone = "default" | "soft" | "raised" | "dark";
type PanelDensity = "compact" | "comfortable" | "flush";

const PANEL_TONE: Record<PanelTone, string> = {
  default: "",
  soft: styles.panelSoft,
  raised: styles.panelRaised,
  dark: styles.panelDark,
};

const PANEL_DENSITY: Record<PanelDensity, string> = {
  compact: styles.panelBodyCompact,
  comfortable: styles.panelBodyComfortable,
  flush: styles.panelBodyFlush,
};

export function WorkspacePanel({
  title,
  description,
  number,
  action,
  tone = "default",
  density = "comfortable",
  className,
  bodyClassName,
  id,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  number?: string;
  action?: ReactNode;
  tone?: PanelTone;
  density?: PanelDensity;
  className?: string;
  bodyClassName?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cx(styles.panel, PANEL_TONE[tone], className)}>
      {(title || description || number || action) && (
        <header className={styles.panelHead}>
          <div className={styles.panelHeading}>
            {number && <span className={styles.panelNumber}>{number}</span>}
            <div>
              {title && <h2 className={styles.panelTitle}>{title}</h2>}
              {description && <p className={styles.panelDescription}>{description}</p>}
            </div>
          </div>
          {action && <div className={styles.panelAction}>{action}</div>}
        </header>
      )}
      <div className={cx(PANEL_DENSITY[density], bodyClassName)}>{children}</div>
    </section>
  );
}

export function SectionProgress({
  items,
  activeId,
  label,
  onChange,
}: {
  items: Array<{ id: string; label: string }>;
  activeId: string;
  label: string;
  onChange?: (id: string) => void;
}) {
  return (
    <nav
      aria-label={label}
      className={styles.progress}
      style={{ "--progress-count": items.length } as CSSProperties}
    >
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          onChange ? (
            <button key={item.id} type="button" aria-current={active ? "step" : undefined} onClick={() => onChange(item.id)} className={cx(styles.progressItem, active && styles.progressItemActive)}>
              <span className={styles.progressIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.progressLabel}>{item.label}</span>
            </button>
          ) : (
            <a key={item.id} href={`#${item.id}`} aria-current={active ? "step" : undefined} className={cx(styles.progressItem, active && styles.progressItemActive)}>
              <span className={styles.progressIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.progressLabel}>{item.label}</span>
            </a>
          )
        );
      })}
    </nav>
  );
}

export function ChoiceGrid({
  columns = 2,
  className,
  children,
}: {
  columns?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        styles.choiceGrid,
        columns === 3 && styles.choiceGridThree,
        columns === 4 && styles.choiceGridFour,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ChoiceTile({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cx(styles.choiceTile, active && styles.choiceTileActive)}
    >
      <span className={styles.choiceMark} aria-hidden="true"><Check strokeWidth={3} /></span>
      <Icon className={styles.choiceIcon} aria-hidden="true" />
      <span className={styles.choiceTitle}>{title}</span>
      {description && <span className={styles.choiceDescription}>{description}</span>}
    </button>
  );
}

export function NumberStepper({
  id,
  value,
  min = 1,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  id: string;
  value: string;
  min?: number;
  onChange: (value: string) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const numeric = Number(value) || min;
  const step = (delta: number) => onChange(String(Math.max(min, numeric + delta)));

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.stepperButton}
        aria-label={decreaseLabel}
        disabled={numeric <= min}
        onClick={() => step(-1)}
      >
        <Minus aria-hidden="true" />
      </button>
      <input
        id={id}
        className={styles.stepperInput}
        type="number"
        min={min}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        type="button"
        className={styles.stepperButton}
        aria-label={increaseLabel}
        onClick={() => step(1)}
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}

export function FormLayout({ children }: { children: ReactNode }) {
  return <div className={styles.formLayout}>{children}</div>;
}

export function FormStack({ children }: { children: ReactNode }) {
  return <div className={styles.formStack}>{children}</div>;
}

export function FieldStack({ children }: { children: ReactNode }) {
  return <div className={styles.fieldStack}>{children}</div>;
}

export function FormContextRail({ children }: { children: ReactNode }) {
  return <aside className={styles.contextRail}>{children}</aside>;
}

export function SummaryRows({ children }: { children: ReactNode }) {
  return <dl className={styles.summaryRows}>{children}</dl>;
}

export function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className={styles.summaryRow}>
      <dt className={styles.summaryLabel}>{label}</dt>
      <dd className={cx(styles.summaryValue, strong && styles.summaryValueStrong)}>{value}</dd>
    </div>
  );
}

export function FilterToolbar({
  primary,
  secondary,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>{primary}</div>
      {secondary && <div className={styles.toolbarGroup}>{secondary}</div>}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: ReactNode }>;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className={styles.segments}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(styles.segment, active && styles.segmentActive)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function StatePanel({
  icon: Icon,
  title,
  description,
  action,
  tone = "empty",
}: {
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "empty" | "error";
}) {
  return (
    <div className={cx(styles.state, tone === "error" && styles.stateError)} role={tone === "error" ? "alert" : undefined}>
      {tone === "empty" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.stateArt} src="/workspace-art/ground-mist.webp" alt="" aria-hidden="true" loading="lazy" />
      )}
      <div>
        {Icon && <span className={styles.stateIcon}><Icon aria-hidden="true" /></span>}
        <p className={styles.stateTitle}>{title}</p>
        {description && <p className={styles.stateDescription}>{description}</p>}
        {action && <div className={styles.stateAction}>{action}</div>}
      </div>
    </div>
  );
}

export function StateSkeleton({ label }: { label: string }) {
  return <div className={styles.skeleton} aria-busy="true" aria-label={label} />;
}

export function WorkspaceRecordList({
  columns,
  labels,
  children,
}: {
  columns: string;
  labels: ReactNode[];
  children: ReactNode;
}) {
  const style = { "--record-columns": columns } as CSSProperties;
  return (
    <div className={styles.recordList} style={style}>
      <div className={styles.recordHead} aria-hidden="true">
        {labels.map((label, index) => <span key={index}>{label}</span>)}
      </div>
      <div className={styles.recordBody}>{children}</div>
    </div>
  );
}

export function WorkspaceRecordRow({
  href,
  columns,
  children,
}: {
  href?: string;
  columns: string;
  children: ReactNode;
}) {
  const style = { "--record-columns": columns } as CSSProperties;
  if (href) return <Link href={href} className={styles.recordRow} style={style}>{children}</Link>;
  return <div className={styles.recordRow} style={style}>{children}</div>;
}

export function WorkspaceRecordCell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx(styles.recordCell, className)} data-label={label}>{children}</div>;
}
