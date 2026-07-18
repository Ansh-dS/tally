// takes data from redis and store it inside database.
// if having same formId and two different insertions then the below will store the latest one.

// Just adding job to queue.
import { Queue } from 'bullmq'
import { redisOptions } from '@redis/redis-connection'
import { Prisma } from '@prisma/client'
import { FormHeader } from '@utils/store'
import type { VisitorProgress } from './visitor'

/*
you are saying: 
  1. we should do too much calls to the redis:
    i. so saving data to the queue is the best option.
  2. queue have the snapshot of multiple changes along with time where-as:
      redis store the lastst changes and remove overwrites the old changes. 
*/
export interface formJob {
  jobId: string
  userId: string
  formData?: {
    blocks: Prisma.InputJsonValue
    header: FormHeader
  }
}

export interface visitorJob {
  jobId: string
  visitorData?: VisitorProgress
}

// we need credentials here so our queue can able to connect to redis.
export const formQueue = new Queue<formJob>('formQueue', {
  connection: redisOptions,
})

export const visitorQueue = new Queue<visitorJob>('visitorQueue', {
  connection: redisOptions,
})

export interface AiDropOffJob {
  userId?: string
}

export const aiDropOffsQueue = new Queue<AiDropOffJob>('ai-dropoffs-queue', {
  connection: redisOptions,
})

// Register the repeatable cron job for the producer
// sec, miniute, hour, everyday, month, hour=> {a, b, c, d, e, f}
aiDropOffsQueue.add(
  'daily-ai-dropoffs-producer',
  {},
  {
    repeat: { pattern: '0 0 0 * * *' },
  }
)
