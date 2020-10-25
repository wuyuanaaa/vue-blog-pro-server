const mongoose = require('mongoose')
const Tag = require('./tagModel.js') 


const schema = new mongoose.Schema({
  title: String,
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }
  ],
  comments: {
    type: Number,
    default: 0,
    min: 0
  },
  reading: {
    type: Number,
    default: 0,
    min: 0
  },
  html: String,
  markdown: String,
  type: Number, // 0 正常 1 私密
  catalog: [
    {
      lev: Number,
      heading: String,
      label: String
    }
  ]
}, {
  timestamps: true
})

schema.options.toJSON = {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id
    delete ret._id
  }
}

// 删除文章前为 Tag 移除 articles
schema.post('remove', function(doc, next) {
  doc.tags.forEach(item => {
    Tag.updateOne({_id: item}, {$pull: {articles: doc._id}}, null, function(err, row) {
    })
  })
  next()
})

// 保存文章时为 Tag 更新 articles
schema.post('save', function(doc, next) {
  doc.tags.forEach(item => {
    Tag.updateOne({_id: item}, {$addToSet: {articles: doc._id}}, null, function(err, row) {
    })
  })
  next()
})


schema.method({
  tagPull: function() {
    const { id, tags } = this
    tags.forEach(item => {
      Tag.updateOne({_id: item}, {$pull: {articles: id}}, null, function(err, row) {
      })
    })
  },
  tagAdd: function() {
    const { id, tags } = this
    tags.forEach(item => {
      Tag.updateOne({_id: item}, {$addToSet: {articles: id}}, null, function(err, row) {
      })
    })
  }
})


module.exports = mongoose.model('Article', schema);
