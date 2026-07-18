// Autosave endpoint: writes a form snapshot to Redis for a quick client response.
// A background worker later reads the snapshot and persists it to the canonical DB.

import redisClient from '@redis/redis-connection'
import { NextRequest, NextResponse } from 'next/server'
import {
  errorResponse,
  failedResponse,
  successResponse,
} from '@/lib/utils/apiResponse'
import { formQueue } from '@/lib/redis/redis-Queue'
import { protectApiRoute } from '@auth/authorization'
import { tryRefreshToken } from '@auth/session'
import type { FormBlock, FormHeader } from '@utils/store'
import type { ApiResponse } from '@/lib/utils/apiResponse'
import { prismaClient } from '@db/client'
import type { AuthorizedUser } from '@actions/dashboard'

const REDIS_TTL = 86400 // 24 hours

type FormSnapshot = {
  blocks: FormBlock[]
  header: FormHeader
  published?: boolean
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const snapshot = await req.json()
  const { formId } = await params

  // Basic validation
  if (!validateSnapshot(snapshot)) {
    return toRouteResponse(
      failedResponse({
        data: 'Invalid autosave payload',
        statusCode: 400,
        path: req.nextUrl.pathname,
      })
    )
  }

  let actualFormId = formId
  let newlyCreatedId: string | null = null

  try {
    // authenticating user.
    const authRes = await authenticate(req.nextUrl.pathname)
    if (authRes.status !== 'success') return toRouteResponse(authRes)

    const userId = (authRes.data as AuthorizedUser).id

    // if new form, then first create it's new entry.
    if (formId === 'new') {
      actualFormId = await createFormIfNew(formId, snapshot, userId)
      newlyCreatedId = actualFormId
    }

    // pushing job in queue and storing data in redis.
    const redisRes = await writeSnapshotToRedis(actualFormId, snapshot)
    if (redisRes !== 'OK') {
      return toRouteResponse(
        failedResponse({
          data: 'Saving form snapshot to Redis failed',
          statusCode: 500,
          path: req.nextUrl.pathname,
        })
      )
    }
    await enqueueSyncJob(actualFormId, userId, snapshot)

    return toRouteResponse(
      successResponse({
        data: { message: 'saved', newFormId: newlyCreatedId },
        path: req.nextUrl.pathname,
      })
    )
  } catch (err) {
    console.error('AUTOSAVE POST failed:', err)
    return toRouteResponse(
      errorResponse({
        data: err instanceof Error ? err.message : 'Autosave failed',
        statusCode: 500,
        path: req.nextUrl.pathname,
      })
    )
  }
}

/**
 * Convert internal ApiResponse into NextResponse with appropriate HTTP status.
 */
function toRouteResponse(payload: Partial<ApiResponse>) {
  return NextResponse.json(payload, { status: payload.statusCode ?? 200 })
}

/**
 * Validate minimal shape of incoming snapshot to avoid crashing the worker.
 */
function validateSnapshot(snapshot: unknown): snapshot is FormSnapshot {
  if (!snapshot || typeof snapshot !== 'object') return false
  const s = snapshot as FormSnapshot
  return Array.isArray(s.blocks) && typeof s.header === 'object'
}

/**
 * Authenticate request without causing browser redirects (which would disrupt editor state).
 * other functions like getAuthorizedUser.
 */
async function authenticate(path: string) {
  let authRes = await protectApiRoute(path)
  if (authRes.status === 'error') {
    const refreshRes = await tryRefreshToken(path)
    if (refreshRes.status === 'success') authRes = await protectApiRoute(path)
  }
  return authRes
}

/**
 * If frontend used placeholder id 'new', create a DB row immediately so future autosaves
 * can reference a stable form id.
 */
async function createFormIfNew(
  candidateId: string,
  snapshot: FormSnapshot,
  userId: string
) {
  if (candidateId !== 'new') return candidateId

  const created = await prismaClient.form.create({
    data: {
      title: snapshot.header?.title || 'Untitled Form',
      description: snapshot.header?.description,
      blocks: JSON.stringify(snapshot.blocks),
      settings: {},
      userId,
    },
    select: { id: true },
  })

  return created.id
}

/**
 * Persist snapshot to Redis with a TTL (fast, non-blocking for client).
 */
async function writeSnapshotToRedis(formId: string, snapshot: FormSnapshot) {
  const wrapper = {
    blocks: snapshot.blocks,
    published: snapshot.published,
    title: snapshot.header?.title || 'Untitled Form',
    description: snapshot.header?.description,
    header: snapshot.header, // Keeping header to not break other assumptions
  }
  const payload = JSON.stringify(wrapper)
  return redisClient.set(`draft:form:${formId}`, payload, 'EX', REDIS_TTL)
}

/**
 * Enqueue background job to persist snapshot to canonical DB.
 */
async function enqueueSyncJob(
  formId: string,
  userId: string,
  snapshot: FormSnapshot
) {
  const QUEUE_DELAY_MS = 5000
  await formQueue.add(
    'sync-to-database',
    {
      jobId: formId,
      userId,
    },
    { removeOnComplete: true, delay: QUEUE_DELAY_MS }
  )
}
