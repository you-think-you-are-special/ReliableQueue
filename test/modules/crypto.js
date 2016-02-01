const assert = require('chai').assert
const crypto = require('../../src/modules/crypto')

describe('modules/crypto', function () {

  describe('#encrypt()', function () {
    it('should be a string', function (done) {
      var crypted = crypto.encrypt('test', true)
      assert.isString(crypted)
      done()
    })

    it('should be a string', function (done) {
      var crypted = crypto.encrypt('test', {
        algorithm: 'aes192',
        password: 'mppKNo239-f;wef'
      })
      assert.isString(crypted)
      done()
    })

    it('should be a string', function (done) {
      var crypted = crypto.encrypt('test', (str, type) => {
        assert.equal(type, 'encrypt')
        assert.equal(str, 'test')
        return str
      })
      assert.isString(crypted)
      done()
    })
  })

  describe('#decrypt()', function () {
    it('should be a string', function (done) {
      var crypted = crypto.decrypt('test', true)
      assert.isString(crypted)
      done()
    })

    it('should be a string', function (done) {
      var crypted = crypto.decrypt('61eca5a7565355139c580f301b70c892', {
        algorithm: 'aes192',
        password: 'mppKNo239-f;wef'
      })
      assert.isString(crypted)
      done()
    })

    it('should be a string', function (done) {
      var crypted = crypto.decrypt('test', (str, type) => {
        assert.equal(type, 'decrypt')
        assert.equal(str, 'test')
        return str
      })
      assert.isString(crypted)
      done()
    })
  })
})
