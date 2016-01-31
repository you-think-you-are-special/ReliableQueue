var assert = require('assert');
var redis = require('../src/modules/redis')
var P = require('bluebird')
var sinon = require('sinon')
var fakeredis = require('fakeredis')
var Queue = require('../src')

describe('index', function () {

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

  describe('#push()', function () {
    it('should push object job', function () {
      var queue = new Queue()
      return queue.push({
        name: 'My great json task'
      })
        .then((job) => {
          job.sys.createdAt = 1454192685871
          assert.deepEqual(job, {
            data: {
              name: 'My great json task'
            },
            sys: {
              createdAt: 1454192685871,
              checksum: 1802876647
            }
          })
        })
    })

    it('should push string job', function () {
      var queue = new Queue()
      return queue.push('My great json task')
        .then((job) => {
          job.sys.createdAt = 1454192685871
          assert.deepEqual(job, {
            data: 'My great json task',
            sys: {
              createdAt: 1454192685871,
              checksum: -88691050
            }
          })
        })
    })

  })

  describe('#pop()', function () {

    it('should pop object job', function () {
      var queue = new Queue()
      return queue.push({
        name: 'My great json task'
      })
        .then(() => queue.pop())
        .then((job) => {
          job.sys.createdAt = 1454192685871
          assert.deepEqual(job, {
            data: {
              name: 'My great json task'
            },
            sys: {
              createdAt: 1454192685871,
              checksum: 1802876647
            }
          })
        })
    })

    it('should pop string job', function () {
      var queue = new Queue()
      return queue.push('My great json task')
        .then(() => queue.pop())
        .then((job) => {
          job.sys.createdAt = 1454192685871
          assert.deepEqual(job, {
            data: 'My great json task',
            sys: {
              createdAt: 1454192685871,
              checksum: -88691050
            }
          })
        })
    })

  })

})
