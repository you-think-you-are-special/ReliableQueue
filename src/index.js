'use strict'

const EventEmitter = require('events')
const P = require('bluebird')
const CRC32 = require('crc-32')
const ctypto = require('./modules/crypto')
var isBlockPop = false
var autoPop;

/**
 * @param queue
 */
var startAutoPop = (queue) => {
  queue.on('success', () => {
    queue.pop()
  })
  queue.pop()
}

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
    this.redis = require('./modules/redis').createClient(params.redis)
    this.namespace = params.namespace || 'queue'
    this.processPrefix = params.processPrefix || ':process'
    this.messagePrefix = params.messagePrefix || ':message'
    this.errorPrefix = params.errorPrefix || ':error'
    this.timeout = params.timeout || 0
    this.successManualy = params.successManualy || false
    this.encrypt = params.encrypt || true
  }

  /**
   * @param event
   * @param callback
   * @returns {ReliableQueue}
   */
  on(event, callback) {
    if (event === 'job' && !autoPop) {
      startAutoPop(this)
    }

    return super.on.apply(this, arguments)
  }

  /**
   * @param event
   * @param callback
   * @returns {ReliableQueue}
   */
  once(event, callback) {
    if (event === 'job' && !autoPop) {
      startAutoPop(this)
    }

    return super.once.apply(this, arguments)
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

    var save = JSON.stringify(job)
    if (this.encrypt) {
      save = ctypto.encrypt(save, this.encrypt)
    }

    return this.redis.rpushAsync(this.namespace, save)
      .then(() => {
        this.emit('push', job)
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
        if (this.encrypt) {
          job = ctypto.decrypt(job, this.encrypt)
        }

        job = JSON.parse(job)

        var checksum = CRC32.str(JSON.stringify(job.data))
        if (checksum !== job.sys.checksum) {
          isBlockPop = false
          return P.reject(new Error('Checksum is invalid. Data was modified.'))
        }

        this.emit('job', job)
        this.job = job
        if (this.successManualy) {
          return job
        }

        return this.success()
          .then(() => {
            return job
          })
      })
  }

  /**
   * @returns {Promise}
   */
  success() {
    return this.redis.lremAsync(
      this.namespace + this.processPrefix, -1, JSON.stringify(this.job)
    )
      .then(() => {
        var job = this.job;
        isBlockPop = false
        this.emit('success', job)
        return job
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
        this.emit('reject', this.job)
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

  //@todo: get errors()
  //@todo: get progress()
  //@todo: get statistics()
}

module.exports = ReliableQueue
