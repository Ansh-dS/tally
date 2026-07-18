'use server'
import redisClient from '@redis/redis-connection'
import { headers } from 'next/headers'
import { generateVisitorCookie, getVisitor } from '@auth/cookies'
import { generateVisitorToken } from '@auth/jwt'
import { visitorQueue } from './redis-Queue'

export interface VisitorTokenInput {
  visitorId: string
  userAgent: string
  formId: string
}

export interface VisitorProgress {
  lastQuestionVisited: string
  visitorId: string
  userAgent: string
  formId: string
}

const QUEUE_DELAY_MS = 2000

export async function createVisitor(formId: string): Promise<VisitorProgress> {
  const visitorDetails = await getVisitor()

  //if don't have visitor cookie.
  if (visitorDetails === null) {
    const header = await headers()
    const userAgent = header.get('user-agent') || 'Unknown Browser'

    // generate cookie
    const newId = generateVisitorToken(userAgent, formId)
    await generateVisitorCookie(newId)
    return {
      userAgent: userAgent,
      visitorId: newId,
      formId: formId,
      lastQuestionVisited: 'q1',
    }
  }

  // if close the tab, you loose the data.
  return { ...visitorDetails, lastQuestionVisited: 'q1' }
}

//storing data in redis and creating new job in queue.
export async function cacheVisitorAndEnqueueJob(
  details: VisitorTokenInput,
  lastQuestionVisited: string
) {
  const data: VisitorProgress = {
    ...details,
    lastQuestionVisited: lastQuestionVisited,
  }

  const stringifiedData = JSON.stringify(data)
  try {
    const redisResponse = await redisClient.set(
      `store:visitor:${data.visitorId}`,
      stringifiedData,
      'EX',
      86400
    )

    if (redisResponse === 'OK') {
      // Add job to queue.
      await visitorQueue.add(
        'sync-visitor-details',
        {
          jobId: data.visitorId,
          visitorData: data,
        },
        { removeOnComplete: true, delay: QUEUE_DELAY_MS }
      )
    }
  } catch (err) {
    console.error("Can't store visitorDetails in redis ", err)
  }
}

//making server call.
