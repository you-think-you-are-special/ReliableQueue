/* eslint-disable func-names,import/no-extraneous-dependencies,prefer-arrow-callback,global-require,max-len,no-undef */
const assert = require('assert')
const sinon = require('sinon')

describe('unreliable_queue', function () {
  before(function () {
    this.ReliableQueue = require('../src/reliable_queue').ReliableQueue
    this.defaultQueuePrefix = '{queue}'
  })

  beforeEach(function () {
    this.brpop = sinon.stub()
    this.redisClient = {
      duplicate: () => ({
        brpoplpush: sinon.stub(),
        brpop: this.brpop
      }),
      rpush: sinon.spy(),
      lrem: sinon.stub()
    }
  })

  describe('#pop()', () => {
    it('should pop js objects', async function () {
      const taskMock = { data: { name: 'Best ever task' } }

      const queue = new this.ReliableQueue({
        redisClient: this.redisClient,
        noAck: true
      })

      queue.emit = sinon.stub()

      const [task] = await Promise.all([
        queue.pop(),
        this.brpop.callArgWith(2, null, [this.defaultQueuePrefix, JSON.stringify(taskMock)])
      ])

      assert.deepStrictEqual(task.data, taskMock.data, 'Correct task was returned')

      const isBrpopCalledCorrect = this.brpop.calledWith(this.defaultQueuePrefix, 0)
      assert.ok(isBrpopCalledCorrect, 'Redis brpop called with correct params')
      assert.ok(this.brpop.calledOnce, 'Redis brpop called once')

      const isEmitted = queue.emit.calledWith('pop')
      assert.ok(isEmitted, 'Pop event was emitted')
      assert.ok(queue.emit.calledOnce, 'Pop event was emitted once')
      assert.ok(queue.emit.calledOnce, 'success event was emitted once')
    })
  })
})
