const express = require('express')
const { authMiddleware } = require('../utils/jwt.js')
const Img = require('../models/imgModel.js')

const router = express.Router()


// 验证权限
function check (req, res, next) {
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

    if(parseInt(userCookies.type) !== 823) {
      res.json({
        status: '3',
        msg: '没有该权限！',
        result: ''
      });
    } else {
      next();
    }
  } else {
    res.json({
      status: '2',
      msg: '未登录',
      result: ''
    });
  }
}


// 保存图片
router.post('/save', authMiddleware, function (req, res, next) {
  console.log(req.body.file)

  /* const form = new FormData()
  form.append('smfile', req.body.file) */

  
  
 
});

// 获取图片列表
router.get('/list', function(req, res) {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);

  let skip = (page-1)*pageSize;
  let params = {};

  let total;
  Img.countDocuments({},function (err, count) {
    if(err) {
      res.json(err)
    } else {
      total = count;
      let imgsModel = Img.find(params,{delete:true,url:true,filename:true}).sort({date:-1}).skip(skip).limit(pageSize);
      imgsModel.exec(function (err, doc) {
        if (err) {
          console.log(err);
          res.json({
            status: '1',
            msg: err.message
          });
        } else {
          res.json({
            status: '0',
            msg: '',
            result: {
              total: total,
              count: doc.length,
              list: doc
            }
          })
        }
      });
    }
  });
});

// 删除图片
router.post('/remove', function (req, res) {
  check(req, res, () => {
    let _id = req.body._id;

    Img.remove({_id: _id}, function (err) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        res.json({
          status: '0',
          msg: '',
          result: ''
        })
      }
    })
  })
});

module.exports = router
