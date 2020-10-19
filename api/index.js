import user from './user.js'
import article from './article.js'
import img from './img.js'
import comment from './comment.js'
import qiniu from './qiniu.js'
import tag from './tag.js'

export default function(app) {
  app.use('/api/user', user)
  app.use('/api/article', article)
  app.use('/api/img', img)
  app.use('/api/comment', comment)
  app.use('/api/qiniu', qiniu)
  app.use('/api/tag', tag)
}

