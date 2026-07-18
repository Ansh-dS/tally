export type InsightType =
  | 'QUESTIONS_FORM_INSIGHTS'
  | "DASHBOARD_DROPOFF'S"
  | 'FORM_QUALITATIVE_INSIGHTS'

// Define the exact type you provided
export type DropOffStats = {
  status: 'error' | 'success' | 'failed'
  userId: string
  totalWorkspaceDropOffs: number
  forms: {
    formId: string
    formTitle: string
    totalFormDropOffs: number
    questionsDetail: unknown[] // Assuming you have a QuestionStat type defined
  }[]
}

// Store prompts in a clean dictionary
// It contains "#DATA" and "#QUESTION" which will get replaced by actual data and question sent by the user.
export const PROMPTS: Record<InsightType, string> = {
  "DASHBOARD_DROPOFF'S": `You are an expert conversion rate optimization (CRO) analyst.
Analyze the following workspace form performance metrics:
#DATA

Identify the biggest friction points across all forms. 
You MUST return your response matching exactly this JSON structure:
{
  "severityLevel": "Low | Medium | High | Critical",
  "executiveSummary": "A 2-sentence summary of the overall workspace drop-off health.",
  "suspectedFrictionPoints": ["Detail why specific forms/questions are failing."],
  "actionableRecommendations": ["Step-by-step UX improvements."]
}`,

  QUESTIONS_FORM_INSIGHTS: `You are a data analyst assisting a workspace owner.
Here is the analytics data for their forms:
#DATA

The user has asked a specific question regarding this data: "#QUESTION"

Answer their question based ONLY on the provided data.
You MUST return your response matching exactly this JSON structure:
{
  "answer": "A clear, data-backed answer to the user's specific question.",
  "supportingDataPoints": ["Specific metrics from the data that prove your answer."],
  "confidenceLevel": "High | Medium | Low"
}`,

  FORM_QUALITATIVE_INSIGHTS: `You are an expert qualitative data analyst specializing in user feedback.
You have been given open-ended text responses to the following survey question:
#DATA

Your task is to analyze ALL provided responses and extract:
1. An executive summary of the dominant themes.
2. The top intent tags (what users are trying to say), each with a frequency count.
3. The overall sentiment split across ALL responses.

Rules:
- intentTags must be an array of objects with "name" (short 2-4 word label) and "value" (integer count of how many responses match that intent).
- sentimentSplit MUST contain exactly 3 entries, one each for "Positive", "Neutral", and "Negative", where the value is the count of responses in that sentiment bucket. The sum of the three values must equal the total number of responses.
- Do not invent data. Base every value strictly on the responses provided.

You MUST return your response matching exactly this JSON structure:
{
  "executiveSummary": "A 2-3 sentence synthesis of the key themes and overall user sentiment.",
  "intentTags": [
    { "name": "Short intent label", "value": 0 }
  ],
  "sentimentSplit": [
    { "name": "Positive", "value": 0 },
    { "name": "Neutral",  "value": 0 },
    { "name": "Negative", "value": 0 }
  ]
}`,
}
