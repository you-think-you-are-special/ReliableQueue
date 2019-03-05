# Reliable Queue on top of Redis

[![Build Status](https://travis-ci.com/you-think-you-are-special/ReliableQueue.svg?branch=master)](https://travis-ci.com/you-think-you-are-special/ReliableQueue)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)
[![dependencies Status](https://david-dm.org/you-think-you-are-special/ReliableQueue/status.svg?style=flat-square)](https://david-dm.org/you-think-you-are-special/ReliableQueue)
[![codecov](https://codecov.io/gh/you-think-you-are-special/ReliableQueue/branch/master/graph/badge.svg)](https://codecov.io/gh/you-think-you-are-special/ReliableQueue)


Redis is often used as a messaging server to implement processing of background jobs or other kinds of messaging tasks.
A simple form of queue is often obtained pushing values into a list in the producer side, and waiting for this values in the consumer side using RPOP (using polling), or BRPOP if the client is better served by a blocking operation.  
  
However in this context the obtained queue is not reliable as messages can be lost, for example in the case there is a network problem or if the consumer crashes just after the message is received but it is still to process.
RPOPLPUSH (or BRPOPLPUSH for the blocking variant) offers a way to avoid this problem: the consumer fetches the message and at the same time pushes it into a processing list.  
  
It will use the LREM command in order to remove the message from the processing list once the message has been processed.
An additional client may monitor the processing list for items that remain there for too much time, and will push those timed out items into the queue again if needed.

See: http://redis.io/commands/rpoplpush#pattern-reliable-queue

Correct working on redis cluster

## Requirements

* Redis >= 2.4 (because of redis rpush feature)
* Node.js >= 8.11.3


## Usage

```javascript
const { ReliableQueue } = require('reliable_queue')
const redis = require('redis')

const queue = new ReliableQueue({
  prefix: '{my_awesome_queue}', // Optional prefix. See: https://redis.io/topics/cluster-spec#keys-hash-tags
  redisClient: redis.createClient(), // Redis client. See https://github.com/NodeRedis/node_redis or similar interface
  timeoutSec: 120, // Optional. Zero by default. It can be used to block connection indefinitely.
})

// For instance, we have idempotent tasks
// that means we can retry the task with the same effect
(async () => {

  // This is how we add our task/tasks to a queue
  const queueLength = await queue.push([{
    name: 'My great json task'
  }])

  console.info(`Queue length is ${queueLength}`)

  const task = await queue.pop()

  console.log(`${task.data} is ok`)

  // our task was finished success or task.reject('The reason why') ?
  task.success()

})()
  .catch(console.error)

```

See [examples](https://github.com/you-think-you-are-special/ReliableQueue/tree/master/examples)

## Events

You can subscribe on queue events

```javascript
queue.on('success', job => {
  // your code here
})
```

* push - Adding to queue
* pop - Popping from queue
* reject - Job rejection event
* success - Success prepared job

