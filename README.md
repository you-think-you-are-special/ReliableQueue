# Reliable Queue on top of Redis

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](.github/CONTRIBUTING.md)


Redis is often used as a messaging server to implement processing of background jobs or other kinds of messaging tasks.
A simple form of queue is often obtained pushing values into a list in the producer side, and waiting for this values in the consumer side using RPOP (using polling), or BRPOP if the client is better served by a blocking operation.  
  
However in this context the obtained queue is not reliable as messages can be lost, for example in the case there is a network problem or if the consumer crashes just after the message is received but it is still to process.
RPOPLPUSH (or BRPOPLPUSH for the blocking variant) offers a way to avoid this problem: the consumer fetches the message and at the same time pushes it into a processing list.  
  
It will use the LREM command in order to remove the message from the processing list once the message has been processed.
An additional client may monitor the processing list for items that remain there for too much time, and will push those timed out items into the queue again if needed.

See: http://redis.io/commands/rpoplpush#pattern-reliable-queue

Correct working on redis cluster

## Requirements

* Redis >= 2.2.0
* Node.js >= 8.11.3

## Usage

```javascript
const { ReliableQueue } = require('reliable_queue');
const redis = require('redis');

const queue = new ReliableQueue({
  prefix: '{my_awesome_queue}', // Optional prefix. See: https://redis.io/topics/cluster-spec#keys-hash-tags
  redisClient: redis.createClient(), // Redis client. See https://github.com/NodeRedis/node_redis or similar interface
  timeoutSec: 120, // Optional. Zero by default. It can be used to block connection indefinitely.
});

// suppose, we have idempotent tasks
// it means that we can retry the task with same effect
(async () => {

  // first we need to add our task to queue
  const isPushed = await queue.push({
    name: 'My great json task'
  });

  if(!isPushed){
    throw new Error('Task was not pushed');
  }

  const task = await queue.pop();

  // doing something with it...
  console.log(`${task.name} is ok`);

  // our task was finished success or mb task.reject('The reason why') ?
  task.success();

})()
  .catch(console.error);

```

## Events

You can subscribe on queue events

```javascript
queue.on('success', job => {
   // for instance, write your metrics here
});
```

* push - Adding to queue
* pop - Popping from queue
* reject - Job rejection event
* success - Success prepared job

