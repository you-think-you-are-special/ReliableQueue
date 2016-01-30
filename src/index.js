'use strict'

const EventEmitter = require('events')
const _ = require('lodash')
const P = require('bluebird')
const CRC32 = require('crc-32')
var isBlockPop = false

/**
 * @see: http://redis.io/commands/rpoplpush#pattern-reliable-queue
 */
class ReliableQueue extends EventEmitter {

  /**
   * @param params
   */
  constructor(params) {
    super()
    params = params || {}
    this.redis = params.redis || require('./modules/redis').createClient(params.redis)
    this.namespace = params.namespace || 'queue'
    this.processPrefix = params.processPrefix || ':process'
    this.messagePrefix = params.messagePrefix || ':message'
    this.errorPrefix = params.errorPrefix || ':error'
    this.timeout = params.timeout || 0
    this.successManualy = params.successManualy || false
  }

  /**
   * @param data
   * @returns {Promise}
   */
  push(data) {
    var job = {
      data: data,
      sys: {
        createdAt: Date.now(),
        checksum: CRC32.str(JSON.stringify(data))
      }
    }
    return this.redis.rpushAsync(this.namespace, JSON.stringify(job))
      .then(() => {
        this.emit('push')
        return job
      })
  }

  /**
   * @returns {Promise}
   */
  pop() {
    if (isBlockPop) {
      return P.reject(new Error('#success() was not called'))
    }

    isBlockPop = true
    return this.redis.brpoplpushAsync(
      this.namespace, this.namespace + this.processPrefix, this.timeout
    )
      .then((job) => {
        job = JSON.parse(job)
        var checksum = CRC32.str(JSON.stringify(job.data))
        if (checksum !== job.sys.checksum) {
          isBlockPop = false
          return P.reject(new Error('Checksum is invalid. Data was modified.'))
        }

        this.job = job
        if (this.successManualy) {
          return job
        }

        return this.success()
          .then(() => {
            this.emit('pop')
            return job
          })
      })
  }

  /**
   * @returns {Promise}
   */
  success() {
    return this.redis.lremAsync(this.namespace + this.processPrefix, -1, this.job)
      .then(() => {
        isBlockPop = false
        return this.job
      })
  }

  /**
   * @param msg optional
   * @returns {Promise}
   */
  reject(msg) {
    this.job.sys.error = {
      msg: msg || ''
    }
    return this.redis.rpushAsync(
      this.namespace + this.errorPrefix, JSON.stringify(this.job)
    )
      .then(() => {
        isBlockPop = false
        this.emit('reject')
        return this.job
      })
  }

  /**
   * @param msg optional
   * @returns {Promise}
   */
  backToQueue(msg) {
    msg = msg || ''
    this.job.sys.backToQueue = this.job.sys.backToQueue || {
      attempts: 0, info: []
    }
    this.job.sys.backToQueue.attempts++
    this.job.sys.backToQueue.info.push({
      msg: msg,
      sys: this.job.sys
    })
    return this.push(this.job.data)
  }
}

module.exports = ReliableQueue
