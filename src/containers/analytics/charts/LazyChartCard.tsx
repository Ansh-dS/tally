'use client'

/**
 * LazyChartCard.tsx
 *
 * A generic viewport-aware wrapper that defers rendering heavyweight chart
 * children (SVG, canvas, Recharts) until they scroll near the viewport.
 *
 * Behaviour:
 *  - The `title` and optional `description` are ALWAYS rendered immediately
 *    so the user can scan all question labels while scrolling.
 *  - `triggerOnce: true` ensures the chart mounts once and never unmounts
 *    when the user scrolls back up — no re-render thrashing.
 *  - `rootMargin: '200px 0px'` pre-fires the observer 200 px before the
 *    element enters the visible viewport, so the chart is ready before the
 *    user reaches it.
 *  - While `!inView`, a Tailwind `animate-pulse` skeleton block is shown as
 *    a height-preserving placeholder that prevents layout shift.
 *
 * Usage:
 *   <LazyChartCard title="How satisfied are you?" description="Toggle switch">
 *     <BinaryStatWidget data={data} questionLabel="How satisfied are you?" />
 *   </LazyChartCard>
 */

import React from 'react'
import { useInView } from 'react-intersection-observer'
import { Text } from '@primitives/Text/Text'
import { Stack } from '@primitives/Stack/Stack'

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
export interface LazyChartCardProps {
  /**
   * The question label — always rendered immediately above the chart so
   * the user can scan all questions without waiting for charts to load.
   */
  title: string

  /**
   * Optional subtitle shown below the title (e.g., block type, response count).
   * Rendered immediately alongside the title.
   */
  description?: string

  /**
   * The chart component to lazily render (e.g., <QualitativeIntentChart />).
   * Only mounted once the wrapper scrolls within `rootMargin` of the viewport.
   */
  children: React.ReactNode

  /**
   * Height of the animated skeleton placeholder in pixels.
   * Should roughly match the expected chart height to prevent layout shift.
   * @default 300
   */
  skeletonHeight?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function LazyChartCard({
  title,
  description,
  children,
  skeletonHeight = 300,
}: LazyChartCardProps) {
  const { ref, inView } = useInView({
    /**
     * Fires 200 px before the element enters the visible viewport.
     * Negative bottom margin keeps the observer silent while scrolling away.
     */
    rootMargin: '200px 0px',

    /**
     * Once triggered, the observer disconnects — charts never unmount when
     * the user scrolls back up.
     */
    triggerOnce: true,
  })

  return (
    <Stack ref={ref} align="stretch" className="w-full gap-3">
      {/* ── Always-visible header ────────────────────────────────────────── */}
      {/*
        Rendered outside the deferred children block so the user can read
        all question labels while the charts load progressively.
      */}
      <Stack gap="sm">
        <Text variant="subheader" weight="semibold" color="primary">
          {title}
        </Text>

        {description && (
          <Text variant="caption" color="secondary">
            {description}
          </Text>
        )}
      </Stack>

      {/* ── Lazy content / skeleton ──────────────────────────────────────── */}
      {inView ? (
        children
      ) : (
        /*
          height-preserving skeleton so sibling layout doesn't shift when
          the chart mounts. `animate-pulse` is a standard Tailwind utility
          that works without any additional setup.
        */
        <div
          className="w-full animate-pulse rounded-md bg-slate-100"
          style={{ height: skeletonHeight }}
          aria-hidden="true"
        />
      )}
    </Stack>
  )
}
