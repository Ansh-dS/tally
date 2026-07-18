import { handleQueryError } from '@db/query-error'
import { FormHeader } from '@utils/store'
import { Prisma } from '@prisma/client'
import { prismaClient } from '@db/client'
import redisClient from '@redis/redis-connection'
import { VisitorProgress } from './visitor'

interface formType {
  /* 
       Generic TS interfaces (like FormBlock[]) often clash with Prisma's strict internal JSON types:
        so we use "InputJsonValue"
    */
  blocks: Prisma.InputJsonValue
  header?: FormHeader
  title?: string
  description?: string
}

export async function syncFormToDatabase(formId: string, payload?: formType) {
  // formId is guaranteed to be a real database ID now (e.g. cuid123)
  let form = payload

  if (!form) {
    const redisData = await redisClient.get(`draft:form:${formId}`)
    if (!redisData) {
      console.warn(`WORKER: no draft found in Redis for form ${formId}`)
      return
    }
    form = JSON.parse(redisData) as formType
  }

  try {
    // We just do a simple update!
    await prismaClient.form.update({
      where: { id: formId },
      data: {
        blocks:
          typeof form.blocks === 'string'
            ? form.blocks
            : JSON.stringify(form.blocks),
        title: form.title ?? form.header?.title,
        description: form.description ?? form.header?.description,
      },
    })
    console.log('Data stored successfully in database. ')
  } catch (err) {
    const handled = handleQueryError(err, 'src/lib/redis/redis-worker')
    if (handled.message === 'Record not found or access denied.') {
      console.warn(
        `WORKER: Form ${formId} not found in database (likely a demo form or recently deleted). Skipping sync.`
      )
      return
    }
    throw new Error(handled.message || 'WORKER: failed to update form')
  }
}

export async function syncVisitorProgress(data: VisitorProgress | undefined) {
  console.log(data)
  if (!data) {
    throw new Error('WORKER: missing visitor progress')
  }
  try {
    await prismaClient.formVisitor.upsert({
      where: {
        // 'where'=> only take one parameter,so we combine two parameters under one.
        formId_visitorId: {
          formId: data.formId,
          visitorId: data.visitorId,
        },
      },
      update: {
        userAgent: data.userAgent,
        lastVisitedQuestion: data.lastQuestionVisited,
      },
      create: {
        formId: data.formId,
        visitorId: data.visitorId,
        userAgent: data.userAgent,
        lastVisitedQuestion: data.lastQuestionVisited,
      },
    })
  } catch (err) {
    const handled = handleQueryError(err, 'src/lib/redis/redis-worker-utils')
    throw new Error(
      handled.message || 'WORKER: failed to sync visitor progress'
    )
  }
}
