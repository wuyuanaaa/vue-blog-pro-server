const jwt = require('jsonwebtoken')
const { secretKey } = require('../config.js')
const User = require('../models/userModel')

function signToken(obj) {
  return jwt.sign(obj, secretKey, {
    expiresIn: '7h'
  })
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if(err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}

function authMiddleware(req, res, next) {
  const token = req.cookies['Blog-Token']
  if (token) {
    verifyToken(token)
      .then(({ id }) => {
        req.userId = id
        next()
      })
      .catch(err => {
        res.status(401).json({
          code: 0,
          msg: 'token 解析失败',
          data: err
        })
      })
  } else {
    res.status(401).json({
      code: 0,
      msg: '无效 token'
    })
  }
}

async function adminAuthMiddleware(req, res, next) {
  const { userId } = req
  const userDoc = await User.findOne({ _id: userId })
  if (!userDoc) {
    res.status(401).json({
      code: 0,
      msg: '无效用户'
    })
    return
  }
  if (userDoc.role !== 71) {
    res.status(400).json({
      code: 0,
      msg: '当前用户无权限'
    })
    return
  }
  next()
}

module.exports = {
  signToken,
  verifyToken,
  authMiddleware,
  adminAuthMiddleware
}