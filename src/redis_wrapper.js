const promisify = (client, method) => {
  return (...params) => {
    return new Promise((resolve, reject) => {
      client[method](...params, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        resolve(res)
      })
    })
  }
}

module.exports.wrap = (client) => {
  return {
    rpush: promisify(client, 'rpush'),
    lrem: promisify(client, 'lrem'),
    brpop: promisify(client, 'brpop'),
    brpoplpush: promisify(client, 'brpoplpush')
  }
}
