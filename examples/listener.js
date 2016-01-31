const Queue = require('../src/')

var queuePusher = new Queue({
  namespace: 'my_awesome_queue'
})

var queue = new Queue({
  namespace: 'my_awesome_queue',
  successManualy: true //optional
})

setInterval(function () {

  console.log('push')
  queuePusher.push({
    name: 'My great json task'
  })
}, 1000)

queue.on('job', (job) => {
  //do something..
  console.log(job)
  queue.success() //if successManualy = true
})
