import { Redis } from 'ioredis'

export const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  connectTimeout: 10000, // High-tier security: ensure we don't hang the process if Redis is down
  /*
        a. By default, the ioredis client has a retry limit.
        b. BullMQ workers constantly poll Redis for new jobs.
        c. If Redis goes down or becomes unreachable, the worker’s Redis client will start failing requests.
    */
  maxRetriesPerRequest: null,
  password: process.env.REDIS_PASSWORD,
}

/*
used ioredis over redis as don't need to write the logic of ".connect":
  autoConnects the stuff while making call. 
*/
function generateClientHandler() {
  const redis = new Redis(redisOptions)
  return redis
}

/* 
we are using unkown as "global" has it's own types. 
    we first neutrilaize that type then provide ours.
*/
const globalForRedis = global as unknown as { redisClient: Redis }

function generateClient() {
  const redisClient = globalForRedis.redisClient || generateClientHandler()

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redisClient = redisClient
  }
  return redisClient
}

const redisClient = generateClient()

export default redisClient
