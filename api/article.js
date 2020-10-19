import express from 'express'
import Article from '../models/articleModel.js'
import { authMiddleware } from '../utils/jwt.js'

const router = express.Router()

/* 创建新文章 */
router.post('/create',
  authMiddleware,
  (req, res) => {
    new Article({ ...req.body }).save((err, article) => {
      if (err) {
        res.json({
          code: 0,
          msg: '发布失败！',
          data: err
        })
        return;
      }
      res.json({
        code: 1,
        data: article,
        msg: '发布成功！'
      })
    })
  }
)

/* 编辑文章 */
router.put('/edit',
  authMiddleware,
  (req, res) => {
    const { id, ...data } = req.body

    Article.findById(id, function(err, doc){
      doc.tagPull()
    })

    Article.findOneAndUpdate({_id: id}, {$set: data},{ new: true}, function (err, doc) {
      doc.tagAdd()
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

/* 删除文章 */
router.delete('/remove',
  authMiddleware,
  (req, res) => {
    const id = req.body.id

    Article.findById(id, function (err, doc) {
      if (err) {
        res.json({
          code: 0,
          msg: err.message
        })
      } else {
        if (doc === null) {
          res.json({
            code: 0,
            msg: '没有找到该文章！'
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

/* 获取全部文章分页 */
router.get('/page/all',
  authMiddleware,
  (req, res) => {
    let { page, pageSize, title, tag } = req.query

    page = parseInt(page)
    pageSize = parseInt(pageSize)

    const skip = (page - 1) * pageSize

    const query = {}
    if (title) {
      query.title = {$regex: new RegExp(title)}
    }
    if (tag) {
      query.tags = { $elemMatch: { $eq: tag } }
    }

    Article.countDocuments({}, function (err, count) {
      if (err) {
        res.json({
          code: 0,
          data: err,
          msg: '获取文章数量错误！'
        })
      } else {
        const articlesModel = Article.find(query, {
          title: true,
          tags: true,
          reading: true,
          html: true,
          markdown: true,
          type: true,
          catalog: true,
          createdAt: true,
          updatedAt: true
        }).populate('tags').sort({updatedAt: -1}).skip(skip).limit(pageSize)
        articlesModel.exec(function (err, doc) {
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

/* 获取全部文章分页 */
router.get('/page', (req, res, next) => {
  let { page, pageSize, title, tag } = req.query
  page = parseInt(page)
  pageSize = parseInt(pageSize)
  const skip = (page - 1) * pageSize

  const query = {}
  if (title) {
    query.title = {$regex: new RegExp(title)}
  }
  if (tag) {
    query.tags = { $elemMatch: { $eq: tag } }
  }

  Article.countDocuments({}, (err, count) => {
    if (err) next(err)
    Article.find(query, {
      title: true,
      tags: true,
      reading: true,
      html: true,
      markdown: true,
      type: true,
      catalog: true,
      createdAt: true,
      updatedAt: true
    }).populate('tags').sort({updatedAt: -1}).skip(skip).limit(pageSize).exec((err, doc) => {
      if(err) next(err)
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
    })
  })
})

/* 获取文章列表 */
router.get('/list', (req, res, next) => {
  Article.find({
    type: 0,
    ...req.query
  }).exec((err, list) => {
    if (err) next(err)
    res.json({
      code: 1,
      data: list
    })
  })
})

/* 获取文章详情 */
router.get('/detail',
  (req, res) => {
    const { id } = req.query
    Article
      .findOne({ _id: id }, {
        title: true,
        tags: true,
        reading: true,
        html: true,
        markdown: true,
        type: true
      })
      .populate('tags')
      .exec(function (err, doc) {
        if (err) {
          res.json({
            code: 0,
            data: err,
            msg: err.message
          })
        } else {
          res.json({
            code: 1,
            data: doc,
            msg: '成功'
          })
        }
      })
  }
)

/* 获取文章详情 并拓展 前一篇 后一篇*/
router.get('/detail/more',
  (req, res) => {
    const { id } = req.query
    const data = {}
    Article
      .findOne({ _id: id }, {
        title: true,
        tags: true,
        reading: true,
        html: true,
        markdown: true,
        type: true,
        catalog: true,
        createdAt: true,
        updatedAt: true
      })
      .populate('tags')
      .then(doc => {
        data.detail = doc
        const { updatedAt } = doc

        return Promise.all([
          Article.findOne({updatedAt: {$gt: updatedAt}, type: {$eq: 0}}),
          Article.findOne({updatedAt: {$lt: updatedAt}, type: {$eq: 0}})
        ])
      })
      .then(docList => {
        data.next = docList[0]
        data.prev = docList[1]
        res.json({
          code: 1,
          data,
          msg: '成功'
        })
      })
      .catch(e => {
        res.json({
          code: 0,
          data: e,
          msg: e.message
        })
      })
  }
)


// 获取标签所有文章
router.get('/tag', function (req, res) {
  let tagModel = Article.find({tags: req.query.tag, type: {$ne: 1}}, {title: true, date: true}).sort({date: -1});

  tagModel.exec(function (err, doc) {
    if (err) {
      console.log(err);
      res.json({
        code: 0,
        msg: err.message
      });
    } else {
      res.json({
        code: 1,
        msg: '成功',
        data: {
          list: doc
        }
      })
    }
  });

});

// 添加文章
router.post('/save', function (req, res) {
  check(req, res, () => {
    new Article(req.body).save(function (err) {
      if (err) {
        res.status(500).send();
        return
      }
      res.send({
        status: '0'
      });
    })
  })
});

// 修改文章
router.post('/change', function (req, res) {
  check(req, res, () => {
    let _id = req.body._id;
    let newData = req.body.newData;

    Article.update({_id: _id}, {$set: newData}, function (err, doc) {
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
  });
});



export default router