import { type WorkspaceStats } from '../redis/ai-dropoff-data'
import { type llmModels } from './chooseAi/llmProvider'
import { type InsightType } from './prompts'

//utitls:
export interface DashboardDropoffInsight {
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  executiveSummary: string
  suspectedFrictionPoints: string[]
  actionableRecommendations: string[]
}

export type RechartsDataPoint = { name: string; value: number }
export type SentimentDataPoint = {
  name: 'Positive' | 'Neutral' | 'Negative'
  value: number
}
export interface FormQualitativeInsight {
  executiveSummary: string
  intentTags: RechartsDataPoint[] // Passed directly to <BarChart data={...} />
  sentimentSplit: SentimentDataPoint[] // Passed directly to <PieChart data={...} />
}

// Inputs of Ai .
// feature 1.
interface Feature1Inputs {
  data: WorkspaceStats
  modleName: llmModels
  featureType: InsightType
}

export interface Feature2Inputs {
  data: {
    questionId: string
    questionLabel: string
    rawResponses: string[] // e.g., ["The UI froze", "Great pricing", ...]
  }
  modelName: llmModels
  featureType: InsightType // e.g., "FORM_QUALITATIVE_INSIGHTS"
}

// Outputs of Ai .
// feature 1
export interface aiDropOffSummary {
  status: 'success' | 'error'
  data: DashboardDropoffInsight | null
  message: string
}

export interface aiFormQualitativeSummary {
  status: 'success' | 'error'
  data: FormQualitativeInsight | null
  message: string
}

export interface FormDifficultiesInsight {
  overallAssessment: string
  topDifficultQuestions: {
    questionKey: string
    questionLabel: string
    dropOffCount: number
    suspectedReason: string
  }[]
}

export interface QuestionFormInsight {
  answer: string
  supportingDataPoints: string[]
  confidenceLevel: 'High' | 'Medium' | 'Low'
}
