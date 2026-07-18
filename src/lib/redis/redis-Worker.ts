// This is independent file which we have to start using another terminal and command.
import { Worker, Job } from 'bullmq'
import { redisOptions } from '@redis/redis-connection'
import { formJob, visitorJob } from './redis-Queue'
import { syncFormToDatabase, syncVisitorProgress } from './redis-worker-utils'
import {
  processAiDropOffsProducer,
  processAiDropOffsConsumer,
} from './aiDropOffs'

// 1. formWorker.
const formWorker = new Worker<formJob>(
  'formQueue',
  async (job: Job<formJob>) => {
    const { jobId } = job.data // asking data from queue.
    await syncFormToDatabase(jobId)
  },
  {
    connection: redisOptions, // provding redis credentials.
    autorun: false /* autorun: false prevents the worker from starting the moment this file is imported.*/,
  }
)

// worker event loging.
formWorker.on('completed', (job) => console.log('job completed', job.id))
formWorker.on('failed', (job, err) =>
  console.error(new Date().toISOString(), 'WORKER FAILED:', job?.id, err)
)
formWorker.on('error', (err) =>
  console.error(new Date().toISOString(), 'WORKER ERROR:', err)
)

// 2. visitorWorker
const visitorWorker = new Worker<visitorJob>(
  'visitorQueue',
  async (job: Job<visitorJob>) => {
    const { visitorData } = job.data // asking data from queue.
    await syncVisitorProgress(visitorData)
  },
  {
    connection: redisOptions,
    autorun: false,
  }
)

visitorWorker.on('completed', (job) =>
  console.log('visitor job completed', job.id)
)
visitorWorker.on('failed', (job, err) =>
  console.error(
    new Date().toISOString(),
    'VISITOR WORKER FAILED:',
    job?.id,
    err
  )
)
visitorWorker.on('error', (err) =>
  console.error(new Date().toISOString(), 'VISITOR WORKER ERROR:', err)
)

// 3. aiDropOffsWorker
const aiDropOffsWorker = new Worker(
  'ai-dropoffs-queue',
  async (job: Job) => {
    if (job.name === 'daily-ai-dropoffs-producer') {
      await processAiDropOffsProducer()
    } else if (job.name === 'daily-ai-dropoffs-consumer') {
      const { userId } = job.data
      if (userId) {
        await processAiDropOffsConsumer(userId)
      }
    }
  },
  {
    connection: redisOptions,
    autorun: false,
  }
)

aiDropOffsWorker.on('completed', (job) =>
  console.log('AI DropOffs job completed', job.name, job.id)
)
aiDropOffsWorker.on('failed', (job, err) =>
  console.error(
    new Date().toISOString(),
    'AI DROPOFFS WORKER FAILED:',
    job?.id,
    err
  )
)
aiDropOffsWorker.on('error', (err) =>
  console.error(new Date().toISOString(), 'AI DROPOFFS WORKER ERROR:', err)
)

/* 3. the entry point. */
export function startWorker() {
  formWorker.run().catch((err) => {
    console.error('FORM WORKER: failed to start', err)
  })
  visitorWorker.run().catch((err) => {
    console.error('VISITOR WORKER: failed to start', err)
  })
  aiDropOffsWorker.run().catch((err) => {
    console.error('AI DROPOFFS WORKER: failed to start', err)
  })
}

startWorker()
