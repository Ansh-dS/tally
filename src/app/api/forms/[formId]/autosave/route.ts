// FAST LANE: stores the forms data to the redis and sends successfully stores data to user.
// rest of the big process, storing data to database happens afterwards using buidlMQ.
import redisClient from '@redis/redis-connection'
import { NextRequest, NextResponse } from 'next/server'
import {
  errorResponse,
  failedResponse,
  successResponse,
} from '@utils/responses'
import { jobQueue } from '@/lib/redis/redis-Queue'
import { protectApiRoute } from '@auth/authorization'
import { tryRefreshToken } from '@auth/session'
import type { FormBlock, FormHeader } from '@utils/store'
import type { ApiResponse } from '@utils/responses'
import { prismaClient } from '@db/client'
import type { AuthorizedUser } from '@actions/dashboard'

interface formType {
  blocks: FormBlock[]
  header: FormHeader
}

/* 
At API endpoints we can't send return our designed error/success reponses:
    we must use "NextResponse". 
*/
function toRouteResponse(payload: Partial<ApiResponse>) {
  return NextResponse.json(payload, { status: payload.statusCode ?? 200 })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const data: formType = await req.json()
  const { formId } = await params

  let actualFormId = formId
  let newlyCreatedId = null
  console.log("reached autosave")
  try {
    /* 
            Why aren't we use "getAuthorizedUser" as it have "tryRefreshToken" and all the "protectApiRoute" already:
                it contains redirects:
                    redirects reloads our page and hence we lost zustand data.
                    
        
        */
    let authRes = await protectApiRoute(req.nextUrl.pathname)

    // If token expired but refresh token exists, try to refresh silently
    if (authRes.status === 'error') {
      const refreshRes = await tryRefreshToken(req.nextUrl.pathname)
      if (refreshRes.status === 'success') {
        // Retry auth after refresh
        authRes = await protectApiRoute(req.nextUrl.pathname)
      }
    }

    // If auth still failed, return JSON response
    if (authRes.status !== 'success') {
      return toRouteResponse(authRes)
    }

    const userId = (authRes.data as AuthorizedUser).id
    // 1. FAST PATH EXCEPTION: If 'new', create the DB row instantly
    if (formId === 'new') {
      const newForm = await prismaClient.form.create({
        data: {
          title: data.header?.title || 'Untitled Form',
          description: data.header?.description,
          blocks: JSON.stringify(data.blocks),
          settings: {},
          userId: userId,
        },
        select: { id: true },
      })
      actualFormId = newForm.id
      newlyCreatedId = newForm.id // Store it to send back to frontend
    }

    // 2. Now proceed with normal Redis Fast Lane using `actualFormId`
    const formString = JSON.stringify(data)
    const redisResponse = await redisClient.set(
      `draft:form:${actualFormId}`,
      formString,
      'EX',
      3600
    )

    if (redisResponse === 'OK') {
      // 3. Send to worker using the REAL ID
      await jobQueue.add(
        'sync-to-database',
        {
          jobId: actualFormId, // This is never 'new' anymore!
          userId: userId,
          formData: {
            blocks: JSON.stringify(data.blocks),
            header: data.header,
          },
        },
        { removeOnComplete: true, delay: 5000 }
      )
        console.log("Successfuly Added to queue")
      return toRouteResponse(
        successResponse({
          data: {
            message: 'saved',
            newFormId: newlyCreatedId, // 4. Pass the new ID back to the client!
          },
          path: req.nextUrl.pathname,
        })
      )
    }
    return toRouteResponse(
      failedResponse({
        data: 'Saving forms data to redis got failed ',
        statusCode: 500,
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
