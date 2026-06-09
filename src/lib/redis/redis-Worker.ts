// This is independent file which we have to start using another terminal and command.
import { Worker, Job } from 'bullmq'
import { Prisma } from '@prisma/client'
import { prismaClient } from '@db/client'
import redisClient from '@redis/redis-connection'
import { redisOptions } from '@redis/redis-connection'
import { handleQueryError } from '@db/query-error'
import { FormHeader } from '@utils/store'

type SyncJobData = {
  jobId: string
  userId: string
  formData?: formType
}

interface formType {
  /* 
       Generic TS interfaces (like FormBlock[]) often clash with Prisma's strict internal JSON types:
        so we use "InputJsonValue"
    */
  blocks: Prisma.InputJsonValue
  header: FormHeader
}
  console.log("OutSide: woker Started")
// src/lib/redis/redis-worker.ts
async function syncToDatabase(
  formId: string,
  payload?: formType
) {
  // formId is guaranteed to be a real database ID now (e.g. cuid123)
  let form = payload

  if (!form) {
    const redisData = await redisClient.get(`draft:form:${formId}`)
    if (!redisData) throw new Error(`WORKER: no draft found`)
    form = JSON.parse(redisData) as formType
  }
  console.log("WORKER:", form)
  console.log(`WORKER: updating form ${formId}`)

  try {
    // We just do a simple update!
    await prismaClient.form.update({
      where: { id: formId },
      data: {
        blocks: form.blocks,
        title: form.header.title,
        description: form.header.description,
      },
    })
    console.log('Data stored successfully in database. ')
  } catch (err) {
    const handled = handleQueryError(err, 'src/lib/redis/redis-worker')
    console.log("handled:",handled)
    throw new Error(handled.message || 'WORKER: failed to update form')
  }
}

// OUR WORKER
export const worker = new Worker<SyncJobData>(
  'redisQueue',
  async (job: Job<SyncJobData>) => {
    const { jobId, formData } = job.data // asking data from queue.
    await syncToDatabase(jobId, formData)
    
  },
  {
    connection: redisOptions, // provding redis credentials.
    /* 
          autorun: false prevents the worker from starting the moment this file is imported.
        */
    autorun: false,
  }
)

// Basic worker event logging
worker.on('completed', (job) => console.log('job completed', job.id))
worker.on('failed', (job, err) => console.error(new Date().toISOString(), 'WORKER FAILED:', job?.id, err))
worker.on('error', (err) => console.error(new Date().toISOString(), 'WORKER ERROR:', err))
export function startWorker() {
  worker.run().catch((err) => {
    console.error('WORKER: failed to start', err)
  })
}

/* 
   the entry point. 
*/
startWorker()
