const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  tagName: {
    type: String,
    trim: true,
    unique:true
  },
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
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

// 删除标签前 为文章移除该标签
schema.post('remove', function(doc, next) {
  const Article = require('./articleModel.js')

  doc.articles.forEach(item => {
    Article.updateOne({_id: item}, {$pull: {tags: doc._id}}, null, function(err, row) {
    })
  })
  next()
})


module.exports = mongoose.model('Tag',schema)