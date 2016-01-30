const P = require('bluebird')
const redis = P.promisifyAll(require('redis'))

/**
 * @param client
 * @returns {RedisClient}
 */
module.exports.createClient = (client) => {
  if (client instanceof redis.RedisClient) {
    return P.promisifyAll(client)
  }

  return redis.createClient.apply(redis, arguments)
}
