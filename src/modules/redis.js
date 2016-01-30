const P = require('bluebird')
const _ = require('lodash')
const redis = P.promisifyAll(require('redis'))

module.exports.createClient = () => {
  const options = _.isEmpty(arguments) ? [] : arguments
  return redis.createClient.apply(redis, options)
} 