'use client';

import type { ConfidenceLevel } from '@/types/car';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

const CONFIG: Record<ConfidenceLevel, { label: string; bg: string; text: string; dot: string }> = {
  high: {
    label: 'High confidence',
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-800 dark:text-green-300',
    dot: 'bg-green-500',
  },
  medium: {
    label: 'Medium confidence',
    bg: 'bg-amber-50 dark:bg-amber-950',
    text: 'text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  low: {
    label: 'Low confidence',
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-800 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const { label, bg, text, dot } = CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
