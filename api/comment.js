const express = require('express')
const Comment = require('../models/commentModel.js') 
const Article = require('../models/articleModel.js')

const { authMiddleware, adminAuthMiddleware } = require('../utils/jwt.js')

const EventEmitter = require('events') 
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();


const router = express.Router()


// 新增评论
router.post('/create', authMiddleware, async (req, res, next) => {
  const { article } = req.body
  const doc = await new Comment(req.body).save()
  await Article.updateOne({_id: article}, {$inc: {comments: 1}})
  res.json({
    code: 1,
    msg: '成功！',
    data: doc
  })
})

// 获取评论分页
router.get('/page',
[authMiddleware,adminAuthMiddleware],
(req, res, next) => {
  let { page, pageSize, content } = req.query
  page = parseInt(page)
  pageSize = parseInt(pageSize)
  const skip = (page - 1) * pageSize

  const query = {}
  if (content) {
    query.content = {$regex: new RegExp(content)}
  }

  Comment.countDocuments()
    .then(async count => {
      const list = await Comment.find(query)
        .populate('article', 'title')
        .populate('user', ['nickname', 'avatar'])
        .populate('follow', ['nickname', 'avatar'])
        .sort({ updatedAt: -1 }).skip(skip).limit(pageSize)
      res.json({
        code: 1,
        data: {
          total: count,
          count: list.length,
          pages: Math.ceil(count / pageSize),
          list: list
        }
      })
    })
    .catch(e => {
      next(e)
    })
})

// 获取评论列表
router.get('/list', (req, res, next) => {
  const article = req.query.article
  Comment.find({ article })
    .populate('user', ['nickname', 'avatar'])
    .populate('follow', ['nickname', 'avatar'])
    .then(list => {
      res.json({
        code: 1,
        data: list,
        msg: '成功'
      })
    })
    .catch(e => {
      next(e)
    })
})

// 删除评论
router.delete('/remove', 
  [authMiddleware,adminAuthMiddleware], 
  (req, res, next) => {
    const id = req.body.id

    Comment.findOne({ _id: id })
      .then(doc => {
        myEmitter.once('remove', () => {
          doc.remove()
            .then(() => {
              return Article.updateOne({_id: doc.article}, {$inc: {comments: followCount-1}})
            })
            .then(() => {
              res.json({
                code: 1,
                msg: '成功！'
              })
            })
            .catch(e => {
              next(e)
            })
        })
        
        let followCount = 0
        // 如果是一级评论则删除跟随
        if (!doc.follow) {
          Comment.deleteMany({ superior: doc.id }).then(res => {
            followCount -= res.n
            myEmitter.emit('remove')
          }).catch(e => {
            next(err)
          })
        } else { // 如果是二级评论则只删除该条
          myEmitter.emit('remove')
        }
      })
  }
)

module.exports = router
