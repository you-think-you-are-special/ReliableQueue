/* eslint-disable no-await-in-loop,no-constant-condition */
/**
 * producer.js generates tasks with random timeout
 * You can try to run several producers
 */
const redis = require('redis');

const { ReliableQueue } = require('../src/reliable_queue');

const queue = new ReliableQueue({
  redisClient: redis.createClient(),
});

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

(async () => {
  let i = 0;
  while (true) {
    const msg = `PUSHED: ${i} HELLO WORLD!!! Producer pid: ${process.pid}`;
    console.info(msg);
    queue.push([{ msg }]);
    await timeout(getRandomInt(100, 2000)); // lets jobs with random timeout
    i += 1;
  }
})();
