const Queue = require('../src/')
const redis = require('redis')

var queue = new Queue({
  namespace: 'my_awesome_queue',
  redis: redis.createClient()
})

queue.push({
  name: 'My great json task'
})
  .then(() => queue.pop())
  .then(console.log)

// result:
//{ data: { name: 'My great json task' },
//  sys: { createdAt: 1454188768232, checksum: 1802876647 } }
