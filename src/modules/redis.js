const P = require('bluebird')
const _ = require('lodash')
const redis = P.promisifyAll(require('redis'))

module.exports.createClient = (client) => {
    if (client instanceof redis.RedisClient) {
        return P.promisifyAll(client)
    }
    const options = _.isEmpty(arguments) ? [] : arguments
    return redis.createClient.apply(redis, options)
}