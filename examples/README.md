# Let's try this library

#### Dispositions:

* We need redis. You can run it with [docker](https://docs.docker.com/install/) help: `docker run --name reliable_queue_redis -d redis -p 6379:6379`

* [Install Node.js](https://nodejs.org/en/download/)

* Install dependencies: `cd examples && npm ci`


#### We have two files producer.js and consumer.js:

* producer.js generates tasks with random timeout. You can try to run several producers.

* consumer.js processes tasks asap. You can try to run several consumers. Redis should load balancing in this case.