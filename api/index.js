const user = require('./user.js') 
const article = require('./article.js') 
const img = require('./img.js') 
const comment = require('./comment.js') 
const qiniu = require('./qiniu.js') 
const tag = require('./tag.js') 

module.exports = function(app) {
  app.use('/api/user', user)
  app.use('/api/article', article)
  app.use('/api/img', img)
  app.use('/api/comment', comment)
  app.use('/api/qiniu', qiniu)
  app.use('/api/tag', tag)
}

