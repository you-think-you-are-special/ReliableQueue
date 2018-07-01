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
     * @type {number}
     */
    this.timeoutSec = timeoutSec;
  }

  /**
   * @param {Array} tasks
   * @returns {Promise<number>} the length of the list after the push operation
   */
  async push(tasks) {
    const createdAt = Date.now();
    const data = tasks
      .map(task => ({
        data: task,
        sys: { createdAt },
      }));

    const queueLength = await this.rpush(this.queuePrefix, ...data.map(d => JSON.stringify(d)));
    this.emit('push', data);
    return queueLength;
  }

  /**
   * @returns {Promise<*>}
   */
  async pop() {
    const job = await this.brpoplpush(this.queuePrefix, this.progressQueuePrefix, this.timeoutSec);
    const parsedJob = JSON.parse(job);

    /**
     * @returns {Promise<void>}
     */
    parsedJob.success = async () => {
      await this.lrem(this.progressQueuePrefix, -1, job);
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
