// takes data from redis and store it inside database.
// if having same formId and two different insertions then the below will store the latest one.

// Just adding job to queue.
import { Queue } from 'bullmq'
import { redisOptions } from '@redis/redis-connection'
import { Prisma } from '@prisma/client'
import { FormHeader } from '@utils/store'

/*
you are saying: 
  1. we should do too much calls to the redis:
    i. so saving data to the queue is the best option.
  2. queue have the snapshot of multiple changes along with time where-as:
      redis store the lastst changes and remove overwrites the old changes. 
*/
interface queueInput {
  jobId: string
  userId: string
  formData?: {
    blocks: Prisma.InputJsonValue
    header: FormHeader
  }
}

// we need credentials here so our queue can able to connect to redis.
export const jobQueue = new Queue<queueInput>('redisQueue', {
  connection: redisOptions,
})
