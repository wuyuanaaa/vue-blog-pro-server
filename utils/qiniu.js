import qiniu from 'qiniu'

const accessKey  = 'FYKcVBHE8qmvbMoI86EIVZWJYdqb1zhAXN_IqU1R'
const secretKey  = 'oU1cL5wIDcf6qpZSH8VT0zCwH1AAjqNljcPAwpMp'

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

const options = {
  scope: 'yuanaaa'
}

const putPolicy = new qiniu.rs.PutPolicy(options)
// const uploadToken=   putPolicy.uploadToken(mac)
export const uploadToken = function() {
  return putPolicy.uploadToken(mac)
}
