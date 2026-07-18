import { prismaClient } from '@db/client'
import { Prisma } from '@prisma/client'
import { getWorkspaceDropOffDataForAI } from './ai-dropoff-data'
import { aiResponse } from '../ai/chooseAi/llmProvider'
import { aiDropOffsQueue } from './redis-Queue'

// 1. Types & Interfaces (Your exact structural variables)
export interface QuestionStat {
  questionKey: string // q1, q2 etc.
  questionLabel: string
  droppedCount: number
}

export interface FormStat {
  formId: string
  formTitle: string
  totalFormDropOffs: number
  questionsDetail: QuestionStat[]
}

export interface WorkspaceStats {
  status: 'success' | 'failed' | 'error'
  userId: string
  totalWorkspaceDropOffs: number
  forms: FormStat[]
}

/**
 * PRODUCER: (Invoked by BullMQ Cron at Midnight)
 * Finds only users who suffered form abandonment today and enqueues them for processing.
 */
export const processAiDropOffsProducer = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const activeForms = await prismaClient.form.findMany({
      where: {
        formVisitors: {
          some: {
            hasSubmitted: false,
            createdAt: { gte: oneDayAgo },
          },
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    })

    if (activeForms.length === 0) {
      console.log(
        'Midnight Job Complete: No active drop-off analytics found today.'
      )
      return
    }

    const userIds = activeForms.map((f) => f.userId)

    for (const userId of userIds) {
      await aiDropOffsQueue.add('daily-ai-dropoffs-consumer', { userId })
    }

    console.log(
      `Successfully dispatched ${userIds.length} users to the BullMQ consumer processing line.`
    )
  } catch (err) {
    console.error(
      'CRITICAL ERROR: Producer runtime failed to push to queue:',
      err
    )
    throw err
  }
}

/**
 * CONSUMER: (Invoked Automatically by BullMQ Worker)
 * Builds analytics and hits the AI service.
 */
export const processAiDropOffsConsumer = async (userId: string) => {
  try {
    const dropOffStats = await getWorkspaceDropOffDataForAI(userId)
    console.log('Helper Output:', dropOffStats)

    if (
      dropOffStats.status !== 'success' ||
      dropOffStats.totalWorkspaceDropOffs === 0
    ) {
      console.log(
        `Skipping insight storage for user ${userId}; no drop-off data was available.`
      )
      return
    }

    const aiRes = await aiResponse({
      modelName: 'Groq',
      featureType: "DASHBOARD_DROPOFF'S",
      data: dropOffStats,
    })

    if (aiRes?.status === 'success' && aiRes.data) {
      await prismaClient.userInsight.create({
        data: {
          userId: userId,
          aiInsight: aiRes.data as unknown as Prisma.InputJsonValue,
        },
      })
    }
    console.log(
      `Successfully aggregated and saved AI insight assets for user: ${userId}`
    )
  } catch (err) {
    console.error(
      `COMPLIANCE FAILURE: Aborting processing payload loop for user ${userId}:`,
      err
    )
    throw err
  }
}
