const crypto = require('crypto')
const pass = '?6f8s3_fr4c+yaza4ec*a!waMUxu5ta=' //default
const alg = 'aes-256-ctr' //default

/**
 * @param str
 * @param encrypt
 * @returns {string}
 */
module.exports.encrypt = (str, encrypt) => {
  if (typeof encrypt === 'function') {
    return encrypt(str, 'encrypt')
  }

  var cipher
  var crypted
  if (typeof encrypt === 'object') {
    cipher = crypto.createCipher(encrypt.algorithm, encrypt.password)
    crypted = cipher.update(str, 'utf8', 'hex')
    crypted += cipher.final('hex')
    return crypted
  }

  //default
  cipher = crypto.createCipher(alg, pass)
  crypted = cipher.update(str, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted
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

  var decipher
  var dec
  if (typeof decrypt === 'object') {
    decipher = crypto.createDecipher(decrypt.algorithm, decrypt.password)
    dec = decipher.update(str, 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  }

  //default
  decipher = crypto.createDecipher(alg, pass)
  dec = decipher.update(str, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec
}
