/* eslint-disable func-names,import/no-extraneous-dependencies,prefer-arrow-callback,global-require,max-len,no-undef */
const assert = require('assert');
const sinon = require('sinon');


describe('reliable_queue', function () {
  before(function () {
    this.ReliableQueue = require('../src/reliable_queue').ReliableQueue;
    this.defaultQueuePrefix = '{queue}';
  });

  beforeEach(function () {
    this.brpoplpush = sinon.stub();
    this.redisClient = {
      duplicate: () => ({
        brpoplpush: this.brpoplpush,
      }),
      rpush: sinon.spy(),
      lrem: sinon.stub(),
    };
  });

  describe('#push()', () => {
    it('should push js objects and strings and numbers', async function () {
      const clock = sinon.useFakeTimers();
      const queue = new this.ReliableQueue({
        redisClient: this.redisClient,
      });

      queue.emit = sinon.stub();

      const tasks = [{ name: 'Cool task' }, 'Cool task', 37298563];

      const [isPushed] = await Promise.all([
        queue.push(tasks),
        this.redisClient.rpush.callArgWith(tasks.length + 1, null, tasks.length),
      ]);

      assert.strictEqual(isPushed, tasks.length, 'Task pushed successfully');

      const isRpushCalledCorrect = this.redisClient.rpush.calledWith(this.defaultQueuePrefix);
      assert.ok(isRpushCalledCorrect, 'Redis rpush called with correct params');
      assert.ok(this.redisClient.rpush.calledOnce, 'Redis rpush called once');

      const isEmitted = queue.emit.calledWith('push');
      assert.ok(isEmitted, 'push event was emitted');

      clock.restore();
    });
  });

  describe('#pop()', () => {
    it('should pop js objects', async function () {
      const taskMock = {
        data: { name: 'Best ever task' },
        sys: {
          createdAt: Date.now(),
        },
      };

      const queue = new this.ReliableQueue({
        redisClient: this.redisClient,
      });

      queue.emit = sinon.stub();

      const [task] = await Promise.all([
        queue.pop(),
        this.brpoplpush.callArgWith(3, null, JSON.stringify(taskMock)),
      ]);

      assert.deepEqual(task.data, taskMock.data, 'Correct task was returned');

      const isBrpoplpushCalledCorrect = this.brpoplpush.calledWith(this.defaultQueuePrefix, `${this.defaultQueuePrefix}:progress`, 0);
      assert.ok(isBrpoplpushCalledCorrect, 'Redis brpoplpush called with correct params');
      assert.ok(this.brpoplpush.calledOnce, 'Redis brpoplpush called once');

      const isEmitted = queue.emit.calledWith('pop');
      assert.ok(isEmitted, 'Pop event was emitted');
      assert.ok(queue.emit.calledOnce, 'Pop event was emitted once');
    });
  });
});
