/* eslint-disable no-await-in-loop,no-constant-condition */
/**
 * consumer.js processes tasks asap
 * You can try to run several consumers
 * Redis should load balancing in this case
 */
const redis = require('redis')

const { ReliableQueue } = require('../src/reliable_queue')

process.title = 'unreliable_consumer'

const queue = new ReliableQueue({
  redisClient: redis.createClient(),
  noAck: true
});

(async () => {
  while (true) {
    const task = await queue.pop()
    console.info('RECEIVED:', task.data.msg, `Consumer pid: ${process.pid}`)
  }
})()
  .catch(console.error)
