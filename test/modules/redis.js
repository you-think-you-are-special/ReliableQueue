var assert = require('assert');
var redis = require('../../src/modules/redis')
var nodeRedis = require('redis')
var sinon = require('sinon');
var fakeredis = require('fakeredis')

describe('modules/redis', function () {

  before(function (done) {
    sinon.stub(redis, 'createClient', fakeredis.createClient);
    done()
  })

  after(function () {
    redis.createClient.restore()
  })

  afterEach(function (done) {
    var client = redis.createClient()
    client.flushdb(function () {
      done()
    })
  })

  describe('#createClient()', function () {
    it('should be instance of RedisClient', function () {
      var client = redis.createClient({})
      assert.ok(client instanceof nodeRedis.RedisClient)
    })

    it('should be instance of RedisClient if no params', function () {
      var client = redis.createClient()
      assert.ok(client instanceof nodeRedis.RedisClient)
    })

    it('should be instance of RedisClient if empty params', function () {
      var client = redis.createClient({})
      assert.ok(client instanceof nodeRedis.RedisClient)
    })

    it('should be instance of RedisClient if redis client in params', function () {
      var client = redis.createClient(nodeRedis.createClient())
      assert.ok(client instanceof nodeRedis.RedisClient)
    })

    it('should be instance of RedisClient if another options format', function () {
      var client = redis.createClient('port', 'host', {})
      assert.ok(client instanceof nodeRedis.RedisClient)
    })

  })
})
