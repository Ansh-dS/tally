import { NextRequest, NextResponse } from 'next/server'
import {
  cacheVisitorAndEnqueueJob,
  type VisitorProgress,
} from '@/lib/redis/visitor'

// this manages all requests to visitorRedis and manage it responses.
export async function POST(req: NextRequest) {
  const formVisitor = (await req.json()) as VisitorProgress
  const { visitorId, userAgent, formId, lastQuestionVisited } = formVisitor

  if (!visitorId || !userAgent || !formId || !lastQuestionVisited) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid visitor payload' },
      { status: 400 }
    )
  }

  await cacheVisitorAndEnqueueJob(
    { visitorId, userAgent, formId },
    lastQuestionVisited
  )

  return NextResponse.json({ status: 'success' })
}
