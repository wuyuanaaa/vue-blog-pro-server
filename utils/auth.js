const CryptoJS = require('crypto-js') 

const WEB_KEY = CryptoJS.enc.Latin1.parse('yuanaaatop_admin')
const STORE_SALT = 'lalalala_admin'

const decrypt = (str) => {
  const decrypt = CryptoJS.AES.decrypt(str, WEB_KEY, {
    iv: WEB_KEY,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.ZeroPadding
  })
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)

  return decryptedStr
}

const hmacMD5 = (str) => {
  return CryptoJS.HmacMD5(str, STORE_SALT).toString()
}

module.exports = {
  decrypt,
  hmacMD5
}
