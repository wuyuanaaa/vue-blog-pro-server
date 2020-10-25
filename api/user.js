const express = require('express')
const axios =require('axios') 

const User =require('../models/userModel.js') 
const Code =require('../models/codeModel.js') 

const { signToken, authMiddleware } =require('../utils/jwt.js') 
const { githubClientID, githubClientSecret } =require('../config.js') 
const { hmacMD5 } =require('../utils/auth.js') 
const { body } =require('express-validator') 
const { validateHandler } =require('../utils/validate.js') 
const { transporter } =require('../utils/email.js') 

const router = express.Router()


// 用户登陆
router.post('/login', (req, res, next) => {
  const { username } = req.body
  let { password } = req.body

  const param = { $and: [
    { username: username },
    { password: hmacMD5(password) }
  ]
  }

  User.findOne(param).then(doc => {
    if (doc) {
      const token = signToken({ id: doc.id })
      res.json({
        code: 1,
        msg: '登陆成功！',
        data: {
          token
        }
      })
    } else {
      res.json({
        code: 0,
        msg: '帐号或者密码错误'
      })
    }
  }).catch(e => {
    next(e)
  })
})

// 通过 token 获取用户信息
router.get('/userInfo', authMiddleware, (req, res, next) => {
  const id = req.userId
  User.findOne({
    _id: id
  }, (err, user) => {
    if (err) next(err)
    const { id, nickname, role, email, avatar } = user
    res.json({
      code: 1,
      msg: '成功',
      data: { id, nickname, role, email, avatar }
    })
  })
})

// 发送注册邮件
router.post('/sendCode',
  [
    body('email').isEmail().withMessage('邮箱格式错误')
  ],
  (req, res, next) => {
    if (!validateHandler(req, res)) {
      return
    }
    const { email } = req.body
    const code = Math.floor(Math.random() * 1000000)

    new Code({
      email,
      code
    }).save()
    .then(() => {
      return transporter.sendMail({
        from: '"博客-吴予安" <blog_yuanaaa@163.com>',
        to: email,
        subject: '很高兴遇见你~',
        html: `<p>你的验证码是<b>${code}</b>，10 分钟内有效！</p>`
      })
    })
      .then(() => {
        res.json({
          code: 1,
          msg: '发送验证码成功！'
        })
      })
      .catch(e => {
        next(e)
      })
  }
)

// 用户注册
router.post('/register',
  [
    body('username').matches(/^[a-zA-Z][a-zA-Z0-9-_@]{5,17}$/).withMessage('用户名格式错误'),
    body('nickname').isLength({ min: 1, max: 12 }).withMessage('昵称格式错误'),
    body('password').isLength({ min: 24, max: 24 }).withMessage('密码格式错误'),
    body('email').isEmail().withMessage('邮箱格式错误')
  ],
  async (req, res, next) => {
    if (!validateHandler(req, res)) return
    const { username, nickname, password, email, code } = req.body

    const checkExist = await Promise.all([
      User.findOne({ username }),
      User.findOne({ nickname }),
      User.findOne({ email }),
    ])
    const errMsg = ['用户名已存在', '昵称已存在', '邮箱已存在']

    const checkExistResult = checkExist.reduce((result, cur, index) => {
      if (cur) {
        result.pass = false
        result.msg += result.msg ? `、${errMsg[index]}` : errMsg[index]
      }
      return result
    }, { pass: true, msg: '' })

    if (!checkExistResult.pass) {
      res.json({
        code: 0,
        msg: checkExistResult.msg
      })
      return
    }
    const codeDoc = await Code.findOne({ email, code })
    if (!codeDoc) {
      res.json({
        code: 0,
        msg: '验证码错误'
      })
      return
    }
    if ((new Date() - codeDoc.createdAt) > (10 * 60 * 1000)) {
      res.json({
        code: 0,
        msg: '验证码过期'
      })
      // 移除过期的验证码
      codeDoc.remove()
      return
    }
    // 移除已使用的验证码
    codeDoc.remove()
    const newUser = await new User({
      username,
      nickname,
      role: 1,
      password: hmacMD5(password),
      email
    }).save()
    if (newUser) {
      const token = signToken({ id: newUser.id })
      res.json({
        code: 1,
        data: {
          username: newUser.username,
          nickname: newUser.nickname,
          token
        },
        msg: '注册成功'
      })
      return
    }
    next()
  }
)

// github 登陆 code 获取用户信息
router.get(
  '/github',
  (req, res) => {
    const data = {
      client_id: githubClientID,
      client_secret: githubClientSecret,
      code: req.query.code
    }

    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      data,
      timeout: 5000,
      headers: {
        'accept': 'application/json'
      }
    })
      .then(token => {
        return axios({
          method: 'get',
          url: 'https://api.github.com/user',
          timeout: 5000,
          headers: {
            'Authorization': `token ${token.data.access_token}`
          }
        })
      })
      .then(info => {
      // 处理 github 返回的用户信息
        return handleGithubInfo(info.data)
      })
      .then(data => {
        const token = signToken({ id: data.id })
        res.json({
          code: 1,
          msg: '登陆成功',
          data: {
            token,
            userInfo: data
          }
        })
      })
      .catch(e => {
        res.json({
          code: 0,
          msg: '登陆异常',
          data: e
        })
      })
  })

function handleGithubInfo(info) {
  return new Promise((resolve, reject) => {
    const { id, name, avatar_url, email } = info
    // 查找用户是否已经录入数据库
    User.findOne({
      githubId: id
    }, (err, user) => {
      if (err) {
        console.log('err', err)
      }
      if (user === null) { // 用户不存在
        const newUser = new User({
          username: `github_${id}`,
          role: 2,
          githubId: id,
          nickname: name,
          email,
          avatar: avatar_url
        })
        newUser.save().then(({ id, nickname, avatar }) => {
          resolve({ id, nickname, avatar })
        }).catch(e => {
          reject(e)
        })
      } else {
        resolve(user)
      }
    })
  })
}

module.exports = router
