import express from 'express'
import Tag from '../models/tagModel.js'

import { authMiddleware } from '../utils/jwt.js'
const { body } = require('express-validator')
import { validateHandler } from '../utils/validate.js'

const router = express.Router()

router.get('/list',
  authMiddleware,
  (req, res) => {
    Tag.find(null, {
      id: true,
      tagName: true
    })
    .sort({updateTime: -1})
    .exec((err, doc) => {
      if(err) {
        res.status(400).json({
          code: 0,
          data: err,
          msg: '查询标签列表出错'
        })
      } else {
        res.json({
          code: 1,
          data: doc
        })
      }
    })
  }
)

router.get('/page',
  authMiddleware,
  (req, res) => {
    let { page, pageSize, name } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    const skip = (page - 1) * pageSize
    const query = {}
    if (name) {
      query.tagName = {$regex: new RegExp(name)}
    }

    Tag.countDocuments({}, function(err, count) {
      if (err) {
        res.json({
          code: 0,
          data: err,
          msg: '获取标签数量错误！'
        })
      } else {
        const tagsModel = Tag.find(query, {
          tagName: true,
          articles: true
        }).populate('articles').sort({updatedAt: -1}).skip(skip).limit(pageSize)
        
        tagsModel.exec(function (err, doc) {
          if (err) {
            res.json({
              code: 0,
              data: err,
              msg: err.message
            })
          } else {
            res.json({
              code: 1,
              msg: '成功',
              data: {
                total: count,
                count: doc.length,
                pages: Math.ceil(count/pageSize),
                list: doc
              }
            })
          }
        })
      }
    })
  }
)

router.post('/create',
  authMiddleware,
  [
    body('tagName').isLength({ max: 20 }).withMessage('标签名称不能超过20个字符')
  ],
  (req, res) => {
    if (!validateHandler(req, res)) {
      return
    }

    Tag.findOne({ tagName: req.body.tagName }).exec((err, doc) => {
      if (err) {
        res.json({
          code: 0,
          msg: '添加标签失败！'
        })
      }
      if (doc && doc.length) {
        res.json({
          code: 0,
          msg: '已有同名标签！'
        })
      } else {
        new Tag(req.body).save((err, tag) => {
          if (err) {
            res.json({
              code: 0,
              msg: '添加标签失败！'
            })
          }
          res.json({
            code: 1,
            data: {
              id: tag.id,
              tagName: tag.tagName
            },
            msg: '添加标签成功！'
          })
        })
      }
    })
  }
)


router.get('/detail', (req, res, next) => {
  const id = req.id
  Tag.findOne({ id })
    .populate('articles')
    .exec((err, doc) => {
      if (err) next(err)
      res.json({
        code: 1,
        data: doc
      })
    })
})

router.put('/edit',
  authMiddleware,
  (req, res) => {
    const { id, ...data } = req.body

    Tag.findOneAndUpdate({_id: id}, {$set: data},{ new: true}, function(err, doc) {
      if (err) {
        res.json({
          code: 0,
          msg: '编辑失败'
        })
      } else {
        res.json({
          code: 1,
          msg: '编辑成功！',
          data: doc
        })
      }
    })
  }
)

router.delete('/remove',
  authMiddleware,
  (req, res) => {
    const id = req.body.id

    Tag.findById(id, function(err, doc) {
      if (err) {
        res.json({
          code: 0,
          msg: err.message
        })
      } else {
        if (doc === null) {
          res.json({
            code: 0,
            msg: '没有找到该标签！'
          })
        } else {
          doc.remove()
          res.json({
            code: 1,
            msg: '删除成功！'
          })
        }
      }
    })
  }
)

export default router