const crypto = require('crypto')
const pass = '?6f8s3_fr4c+yaza4ec*a!waMUxu5ta=' //default
const alg = 'aes-256-ctr' //default


/**
 * @param str
 * @param alg
 * @param pass
 * @returns {string}
 * @private
 */
var _encrypt = (str, alg, pass) => {
  var cipher = crypto.createCipher(alg, pass)
  var crypted = cipher.update(str, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted
}

/**
 * @param str
 * @param alg
 * @param pass
 * @returns {string}
 * @private
 */
var _decrypt = (str, alg, pass) => {
  var decipher = crypto.createDecipher(alg, pass)
  var dec = decipher.update(str, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec
}

/**
 * @param str
 * @param encrypt
 * @returns {string}
 */
module.exports.encrypt = (str, encrypt) => {
  if (typeof encrypt === 'function') {
    return encrypt(str, 'encrypt')
  }

  if (typeof encrypt === 'object') {
    return _encrypt(str, encrypt.algorithm, encrypt.password)
  }

  //default
  return _encrypt(str, alg, pass)
}

/**
 * @param str
 * @param decrypt
 * @returns {string}
 */
module.exports.decrypt = (str, decrypt) => {
  if (typeof decrypt === 'function') {
    return decrypt(str, 'decrypt')
  }

  if (typeof decrypt === 'object') {
    return _decrypt(str, decrypt.algorithm, decrypt.password)
  }

  //default
  return _decrypt(str, alg, pass)
}
