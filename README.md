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
 
## How to Contribute

Open a pull request or an issue about what you want to implement / change. Glad for any help!

## License

The MIT License (MIT)

Copyright (c) 2016 Litvinov Alexander

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
