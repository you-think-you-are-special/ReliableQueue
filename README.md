## Reliable Queue on top of Redis

See http://redis.io/commands/rpoplpush#pattern-reliable-queue

## Requirements

* Just written on node v5.4.0. Not ready yet
* Tests and supporting older node versions coming soon

##Usage


```javascript
    var queue = new Queue('my_awesome_queue')
    //Support any type of argument
    queue.push({
        name: 'My great json task'
    })
    queue.push('My great text task')
```

```javascript
    var queue = new Queue('my_awesome_queue')
    queue.pop()
        .then(job => {
            //do something
         })
```
