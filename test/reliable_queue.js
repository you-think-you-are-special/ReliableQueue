/* eslint-disable func-names,import/no-extraneous-dependencies,prefer-arrow-callback,global-require,max-len,no-undef */
const assert = require('assert');
const sinon = require('sinon');


describe('reliable_queue', function () {
  before(function () {
    this.redisClient = {};
    this.ReliableQueue = require('../src/reliable_queue').ReliableQueue;
  });

  describe('#push()', () => {
    it('should push object job', async function () {
      // tests in progress ^^
    });
  });
});
