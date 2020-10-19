import jwt from 'jsonwebtoken'
import { secretKey } from '../config.js'

export function signToken(obj) {
  return jwt.sign(obj, secretKey, {
    expiresIn: '7h'
  })
}

export function verifyToken(token) {
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

export function authMiddleware(req, res, next) {
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
