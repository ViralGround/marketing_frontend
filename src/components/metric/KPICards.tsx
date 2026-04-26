"use client";

interface Props {
  items: Array<{ label: string; value: string; hint?: string }>;
}

export default function KPICards({ items }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-line p-5">
          <p className="text-xs text-muted">{it.label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{it.value}</p>
          {it.hint && <p className="mt-1 text-xs text-faint">{it.hint}</p>}
        </div>
      ))}
    </div>
  );
}
