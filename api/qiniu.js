const express = require('express')
const { authMiddleware } = require('../utils/jwt.js') 
const { uploadToken } = require('../utils/qiniu.js') 

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



module.exports = router