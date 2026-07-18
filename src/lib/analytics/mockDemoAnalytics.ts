/**
 * analytics/mockDemoAnalytics.ts
 *
 * Rich, fully-typed seed data used when a form has zero submissions.
 * Satisfies `FormAggregationResult` exactly — no casts.
 *
 * Block IDs are stable strings so they always match the layout keys.
 */

import type { FormAggregationResult } from '@/lib/analytics/types'

// ── Stable block IDs (layout ↔ aggregatedBlocks must share the same keys) ──
const BID = {
  source: 'demo-block-source',
  features: 'demo-block-features',
  role: 'demo-block-role',
  recommend: 'demo-block-recommend',
  name: 'demo-block-name',
  feedback: 'demo-block-feedback',
} as const

export const mockDemoAnalytics: FormAggregationResult = {
  // ── Identity ──────────────────────────────────────────────────────────────
  formId: 'demo',

  // ── High-level metrics ───────────────────────────────────────────────────
  totalViews: 1_240,
  totalSubmissions: 318,
  conversionRate: '25.6%',

  // ── Layout (one block per chart type) ────────────────────────────────────
  layout: [
    {
      id: BID.source,
      type: 'radio',
      label: 'How did you hear about us?',
      required: false,
      data: {
        options: [
          'Search Engine',
          'Social Media',
          'Friend / Colleague',
          'Blog / Article',
          'Other',
        ],
      },
    },
    {
      id: BID.features,
      type: 'checkbox',
      label: 'Which features do you use most?',
      required: false,
      data: {
        options: [
          'Form Builder',
          'Analytics',
          'AI Insights',
          'Team Collaboration',
          'Integrations',
        ],
      },
    },
    {
      id: BID.role,
      type: 'select',
      label: 'What best describes your role?',
      required: false,
      data: {
        options: [
          'Product Manager',
          'Designer',
          'Engineer',
          'Founder',
          'Marketer',
          'Other',
        ],
      },
    },
    {
      id: BID.recommend,
      type: 'switch',
      label: 'Would you recommend Tally to a colleague?',
      required: false,
      data: { defaultChecked: true },
    },
    {
      id: BID.name,
      type: 'input',
      label: 'Your name',
      required: false,
      data: { placeholder: 'e.g. Jane Smith' },
    },
    {
      id: BID.feedback,
      type: 'textarea',
      label: 'Any additional feedback for our team?',
      required: false,
      data: { placeholder: 'Share your thoughts…' },
    },
  ],

  // ── Aggregated block data ─────────────────────────────────────────────────
  aggregatedBlocks: {
    [BID.source]: {
      blockType: 'SINGLE CHOICE',
      questionLabel: 'How did you hear about us?',
      data: [
        { name: 'Search Engine', value: 112 },
        { name: 'Social Media', value: 78 },
        { name: 'Friend / Colleague', value: 64 },
        { name: 'Blog / Article', value: 42 },
        { name: 'Other', value: 22 },
      ],
    },

    [BID.features]: {
      blockType: 'MULTIPLE CHOICE',
      questionLabel: 'Which features do you use most?',
      data: [
        { name: 'Analytics', value: 201 },
        { name: 'Form Builder', value: 188 },
        { name: 'AI Insights', value: 143 },
        { name: 'Team Collaboration', value: 97 },
        { name: 'Integrations', value: 61 },
      ],
    },

    [BID.role]: {
      blockType: 'SELECT MENU',
      questionLabel: 'What best describes your role?',
      data: [
        { name: 'Product Manager', value: 89 },
        { name: 'Engineer', value: 74 },
        { name: 'Founder', value: 52 },
        { name: 'Designer', value: 48 },
        { name: 'Marketer', value: 33 },
        { name: 'Other', value: 22 },
      ],
    },

    [BID.recommend]: {
      blockType: 'TOGGLE SWITCH',
      questionLabel: 'Would you recommend Tally to a colleague?',
      data: {
        trueCount: 281,
        falseCount: 37,
        total: 318,
        ratioString: '281/318',
      },
    },

    [BID.name]: {
      blockType: 'SHORT TEXT',
      questionLabel: 'Your name',
      data: [
        {
          id: 'demo-r-01',
          value: 'Alex Chen',
          submittedAt: new Date('2025-06-10T09:14:00Z'),
        },
        {
          id: 'demo-r-02',
          value: 'Priya Nair',
          submittedAt: new Date('2025-06-11T11:30:00Z'),
        },
        {
          id: 'demo-r-03',
          value: 'Jordan Williams',
          submittedAt: new Date('2025-06-12T14:05:00Z'),
        },
        {
          id: 'demo-r-04',
          value: 'Sam Okafor',
          submittedAt: new Date('2025-06-13T16:22:00Z'),
        },
        {
          id: 'demo-r-05',
          value: 'Maria Gonzalez',
          submittedAt: new Date('2025-06-14T08:47:00Z'),
        },
      ],
    },

    [BID.feedback]: {
      blockType: 'LONG TEXT',
      questionLabel: 'Any additional feedback for our team?',
      data: [
        {
          id: 'demo-f-01',
          value:
            'The analytics dashboard is a game-changer for our quarterly reviews.',
          submittedAt: new Date('2025-06-10T09:15:00Z'),
        },
        {
          id: 'demo-f-02',
          value: 'Please add CSV export — we need it for our data pipeline.',
          submittedAt: new Date('2025-06-11T11:31:00Z'),
        },
        {
          id: 'demo-f-03',
          value: 'AI summaries save us hours of manual tagging. Love it.',
          submittedAt: new Date('2025-06-12T14:06:00Z'),
        },
        {
          id: 'demo-f-04',
          value:
            "The UI is clean but I'd love dark-mode support for embedded forms.",
          submittedAt: new Date('2025-06-13T16:23:00Z'),
        },
        {
          id: 'demo-f-05',
          value: "Onboarding was super smooth. Best form tool we've tried.",
          submittedAt: new Date('2025-06-14T08:48:00Z'),
        },
      ],
    },
  },

  // ── AI Insight (seeded — matches FormInsight Prisma model shape) ──────────
  formInsight: {
    id: 'demo-insight-01',
    formId: 'demo',
    lastAnalyzedAt: new Date('2025-06-14T09:00:00Z'),
    globalSummary: {
      [BID.feedback]: {
        executiveSummary:
          'Users are highly satisfied with the Analytics and Form Builder features. The top request is CSV export. UX improvements around embedded form theming represent the primary opportunity area.',
        intentTags: [
          { name: 'Feature Request', value: 38 },
          { name: 'Positive Feedback', value: 32 },
          { name: 'UX Improvement', value: 17 },
          { name: 'Integration Ask', value: 9 },
          { name: 'Other', value: 4 },
        ],
        sentimentSplit: [
          { name: 'Positive', value: 72 },
          { name: 'Neutral', value: 19 },
          { name: 'Negative', value: 9 },
        ],
      },
    },
  },
}
