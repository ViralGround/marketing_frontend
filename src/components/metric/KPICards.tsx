"use client";

import { MetricStrip } from "@/components/workspace/WorkspacePrimitives";

interface Props {
  items: Array<{ label: string; value: string; hint?: string }>;
}

export default function KPICards({ items }: Props) {
  return <MetricStrip label="Key metrics" items={items} />;
}
