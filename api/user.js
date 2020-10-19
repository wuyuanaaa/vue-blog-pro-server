import express from 'express'
import axios from 'axios'
import { signToken, authMiddleware } from '../utils/jwt.js'

import {githubClientID, githubClientSecret } from '../config.js'

import { decrypt, hmacMD5 } from '../utils/auth.js'

import User from '../models/userModel.js'


const router = express.Router()

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
})

// 检查登录状态
router.get('/checkLogin', function (req, res, next) {
  if (req.cookies.userName) {
    let userCookies = req.cookies;
    // 有操作则延长 cookie 时间
    res.cookie("type", userCookies.type, {
      path: '/',
      maxAge: 1000*60*30
    });
    res.cookie("userName", userCookies.userName, {
      path: '/',
      maxAge: 1000*60*30
    });
    res.json({
      status: '0',
      msg: '',
      result: {
        userName: req.cookies.userName || ''
      }
    })
  } else {
    res.json({
      status: '2',
      msg: '未登录',
      result: ''
    });
  }
})

// 用户登陆
router.post('/login', (req, res) => {
  
  let { username, password } = req.body
  password = decrypt(password)

  var param = {$and:[
      {username: username},
      {password: hmacMD5(password)}
    ]
  }
  User.findOne(param, function (err, doc) {
    if (err) {
      res.json({
        code: 0,
        msg: err.message
      });
    } else {
      if (doc) {
        const token = signToken({id: doc.id})
        res.json({
          code: 1,
          msg: '登陆成功！',
          data: {
            token
          }
        });
      } else {
        res.json({
          code: 0,
          msg: '帐号或者密码错误'
        })
      }
    }
  })
})

// 用户登出
router.post('/logout', function (req, res, next) {
  res.cookie("userName", "", {
    path: '/',
    maxAge: 0
  });
  res.cookie("type", "", {
    path: '/',
    maxAge: 0
  });
  res.json({
    status: '0',
    msg: '',
    result: ''
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
      const token = signToken({id: data.id})
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
    const { id, name, avatar_url, email} = info
  // 查找用户是否已经录入数据库
    User.findOne({
      githubId: id
    }, (err, user) => {
      if(err) {
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
        newUser.save().then(({id, nickname, avatar}) => {
          resolve({id, nickname, avatar})
        }).catch(e => {
          reject(e)
        })
      } else {
        resolve(user)
      }
    })
  })
  

}


export default router
