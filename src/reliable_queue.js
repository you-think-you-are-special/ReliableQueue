/* eslint-disable max-len */
const EventEmitter = require('events')
const { wrap } = require('./redis_wrapper')

/**
 * @see: http://redis.io/commands/rpoplpush#pattern-reliable-queue
 */
class ReliableQueue extends EventEmitter {
  /**
   * @param {{duplicate: function, rpush: function, lrem: function, brpoplpush: function, brpop: function}} redisClient
   * @param {string} prefix @see: https://redis.io/topics/cluster-spec#keys-hash-tags
   * @param {number} timeoutSec
   * @param {boolean} noAck
   */
  constructor ({ redisClient, prefix = '{queue}', timeoutSec = 0, noAck = false }) {
    super()

    /**
     * @see https://github.com/NodeRedis/node_redis#clientduplicateoptions-callback
     */
    this.clientBlocking = wrap(redisClient.duplicate())
    this.client = wrap(redisClient)

    /**
     * @private
     * @type {string}
     */
    this.queuePrefix = prefix

    /**
     * @private
     * @type {string}
     */
    this.progressQueuePrefix = `${prefix}:progress`

    /**
     * @private
     * @type {string}
     */
    this.errorQueuePrefix = `${prefix}:error`

    /**
     * @private
     * @type {number}
     */
    this.timeoutSec = timeoutSec

    /**
     * @private
     * @type {boolean}
     */
    this.noAck = noAck
  }

  /**
   * @param {Array} tasks
   * @param {{prefix:string}} options
   * @returns {Promise<number>} the length of the list after the push operation
   */
  async push (tasks, { prefix = '' } = {}) {
    const data = tasks
      .map(task => ({ data: task }))

    const queueLength = await this.client.rpush(this.queuePrefix + prefix, ...data.map(d => JSON.stringify(d)))
    this.emit('push', data)
    return queueLength
  }

  /**
   * @param {{prefix:string}} options
   * @returns {Promise<*>}
   */
  async pop ({ prefix = '' }) {
    let job
    if (this.noAck) {
      const res = await this.clientBlocking.brpop(this.queuePrefix + prefix, this.timeoutSec)
      if (res === null) {
        return this.pop({ prefix })
      }

      job = res[1]
    } else {
      job = await this.clientBlocking.brpoplpush(this.queuePrefix + prefix, this.progressQueuePrefix, this.timeoutSec)
      if (job === null) {
        return this.pop({ prefix })
      }
    }

    const parsedJob = JSON.parse(job)
    if (!this.noAck) {
      /**
       * @returns {Promise<void>}
       */
      parsedJob.success = async () => {
        await this.client.lrem(this.progressQueuePrefix, -1, job)
        this.emit('success', job)
        delete parsedJob.reject
      }

      /**
       * @param msg
       * @returns {Promise<void>}
       */
      parsedJob.reject = async (msg = '') => {
        parsedJob.sys.error = { msg }
        await this.client.rpush(this.errorQueuePrefix, parsedJob)
        this.emit('reject', parsedJob)
        delete parsedJob.success
      }
    }

    this.emit('pop', parsedJob)
    return parsedJob
  }
}

module.exports.ReliableQueue = ReliableQueue
