## Reliable Queue on top of Redis

See http://redis.io/commands/rpoplpush#pattern-reliable-queue

## Requirements

* Just written on node v5.4.0. Not ready yet
* Tests and supporting older node versions coming soon

##Usage

simple:
```javascript
   var queue = new Queue({
       namespace: 'my_awesome_queue'
   })
   //Support any type of argument
   queue.push({
       name: 'My great json task'
   })
   queue.push('My great text task')
```

```javascript
   var queue = new Queue({
       namespace: 'my_awesome_queue'
   })
   queue.pop()
       .then(job => {
           //do something
       })
```
advanced:

```javascript
   var queue = new Queue({
       namespace: 'my_awesome_queue',
       redis: redis.createClient(),
       timeout: 3000, //@see: http://redis.io/commands/brpoplpush
       processPrefix: ':process'
       messagePrefix = ':message'
       errorPrefix = ':error'
       successManualy: true //to notify that the job was processed
   })
   //Support any type of argument
   queue.push({
       name: 'My great json task'
   })
```

```javascript
   var queue = new Queue({
       namespace: 'my_awesome_queue'
   })
   queue.pop()
       .then(job => {
        //do something
        return queue.backToQueue('Not ready yet')
       })
       .then(job => {
           //do something
           return queue.success()
       })
       .catch(e => {
           return queue.reject(e.message)
       })
```

## Events

* push
* pop
* reject
