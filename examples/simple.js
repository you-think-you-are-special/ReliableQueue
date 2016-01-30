const Queue = require('../src/')

var queue = new Queue({
  namespace: 'my_awesome_queue'
})

queue.push({
  name: 'My great json task',
  redis: { //@see: https://github.com/NodeRedis/node_redis#options-is-an-object-with-the-following-possible-properties
    host: '127.0.0.1',
    port: 6379
  }
})
  .then(() => queue.pop())
  .then(console.log)

// result:
//{ data: { name: 'My great json task' },
//  sys: { createdAt: 1454188768232, checksum: 1802876647 } }
