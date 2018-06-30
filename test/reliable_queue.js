/* eslint-disable func-names,import/no-extraneous-dependencies,prefer-arrow-callback,global-require,max-len,no-undef */
const assert = require('assert');
const sinon = require('sinon');


describe('reliable_queue', function () {
  before(function () {
    this.ReliableQueue = require('../src/reliable_queue').ReliableQueue;
    this.defaultQueuePrefix = '{queue}';
  });

  beforeEach(function () {
    this.redisClient = {
      duplicate: () => {
        return {
          brpoplpush: sinon.stub(),
        };
      },
      rpush: sinon.spy(),
      lrem: sinon.stub(),
      brpoplpush: sinon.stub(),
    };
  });

  describe('#push()', () => {
    it('should push js object like task', async function () {
      const clock = sinon.useFakeTimers();
      const queue = new this.ReliableQueue({
        redisClient: this.redisClient,
      });
      queue.emit = sinon.stub();

      const task = { name: 'Cool task' };
      const [isPushed] = await Promise.all([
        queue.push(task),
        this.redisClient.rpush.callArgWith(2, null, 1),
      ]);

      assert.strictEqual(isPushed, true, 'Task pushed successfully');

      const dataForSave = {
        task,
        sys: {
          createdAt: Date.now(),
        },
      };

      const isRpushCalledCorrect = this.redisClient.rpush.calledWith(this.defaultQueuePrefix, JSON.stringify(dataForSave));
      assert.ok(isRpushCalledCorrect, 'Redis rpush called');
      assert.ok(this.redisClient.rpush.calledOnce, 'Redis rpush called once');

      const isEmitted = queue.emit.calledWithExactly('push', dataForSave);
      assert.ok(isEmitted, 'Event was emitted');

      clock.restore();
    });
  });
});
