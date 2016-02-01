const crypto = require('crypto')
const pass = '?6f8s3_fr4c+yaza4ec*a!waMUxu5ta=' //default
const alg = 'aes-256-ctr' //default

/**
 * @param str
 * @param encrypt
 * @returns {string}
 */
module.exports.encrypt = (str, encrypt) => {
  //if (typeof encrypt === 'function') {
  //  return encrypt(str, 'encrypt')
  //}
  //
  var cipher
  //if (typeof encrypt === 'object') {
  //  cipher = crypto.createCipher(encrypt.algorithm, encrypt.password)
  //  var crypted = cipher.update(str, 'utf8', 'hex')
  //  crypted += cipher.final('hex')
  //  return crypted
  //}

  //default
  cipher = crypto.createCipher(alg, pass)
  var crypted = cipher.update(str, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted
}

/**
 * @param str
 * @param decrypt
 * @returns {string}
 */
module.exports.decrypt = (str, decrypt) => {
  //if (typeof decrypt === 'function') {
  //  return decrypt(str, 'decrypt')
  //}
  //
  var decipher
  //if (typeof decrypt === 'object') {
  //  decipher = crypto.createDecipher(decrypt.algorithm, decrypt.password)
  //  var dec = decipher.update(str)
  //  dec += decipher.final('utf8')
  //  return dec
  //}

  //default
  decipher = crypto.createDecipher(alg, pass)
  var dec = decipher.update(str, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec
}
