import express from 'express'
import { authMiddleware } from '../utils/jwt.js'
import { uploadToken } from '../utils/qiniu.js'

const router = express.Router()

router.get('/token', authMiddleware, (req, res) => {
  const token = uploadToken()
  console.log(token)

  res.json({
    code: 1,
    msg: '成功！',
    data: {
      token
    }
  })
})



export default router