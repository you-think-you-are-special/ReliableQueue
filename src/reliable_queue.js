/* eslint-disable max-len */
const EventEmitter = require('events');
const { promisify } = require('util');


/**
 * @see: http://redis.io/commands/rpoplpush#pattern-reliable-queue
 */
class ReliableQueue extends EventEmitter {
  /**
   * @param {{duplicate: function, rpush: function, lrem: function, brpoplpush: function}} redisClient
   * @param {string} prefix @see: https://redis.io/topics/cluster-spec#keys-hash-tags
   * @param {number} timeoutSec
   */
  constructor({ redisClient, prefix = '{queue}', timeoutSec = 0 }) {
    super();

    /**
     * @see https://github.com/NodeRedis/node_redis#clientduplicateoptions-callback
     */
    const clientBlocking = redisClient.duplicate();

    /**
     * @private
     */
    this.rpush = promisify(redisClient.rpush).bind(redisClient);

    /**
     * @private
     */
    this.lrem = promisify(redisClient.lrem).bind(redisClient);

    /**
     * @private
     */
    this.brpoplpush = promisify(clientBlocking.brpoplpush).bind(redisClient);

    /**
     * @private
     * @type {string}
     */
    this.queuePrefix = prefix;

    /**
     * @private
     * @type {string}
     */
    this.progressQueuePrefix = `${prefix}:progress`;

    /**
     * @private
     * @type {string}
     */
    this.errorQueuePrefix = `${prefix}:error`;

    /**
     * @private
     * @type {string}
     */
    this.inProgressPrefix = `${prefix}:progress`;

    /**
     * @private
     * @type {number}
     */
    this.timeoutSec = timeoutSec;
  }

  /**
   * @param task
   * @returns {Promise<boolean>}
   */
  async push(task) {
    const data = {
      task,
      sys: {
        createdAt: Date.now(),
      },
    };

    const res = await this.rpush(this.queuePrefix, JSON.stringify(data));
    this.emit('push', data);
    return res === 1;
  }

  /**
   * @returns {Promise<*>}
   */
  async pop() {
    const job = await this.brpoplpush(this.prefix, this.progressQueuePrefix, this.timeoutSec);
    const parsedJob = JSON.parse(job);

    /**
     * @returns {Promise<void>}
     */
    parsedJob.success = async () => {
      await this.lrem(this.inProgressPrefix, -1, job);
      this.emit('success', job);
      delete parsedJob.reject;
    };

    /**
     * @param msg
     * @returns {Promise<void>}
     */
    parsedJob.reject = async (msg = '') => {
      job.sys.error = { msg };
      await this.rpush(this.errorQueuePrefix, job);
      this.emit('reject', job);
      delete parsedJob.success;
    };

    this.emit('pop', parsedJob);
    return parsedJob;
  }
}

module.exports.ReliableQueue = ReliableQueue;
