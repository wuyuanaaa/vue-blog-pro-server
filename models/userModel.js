const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  username: String,
  password: String,
  nickname: String,
  role: Number, // 71 管理员 1 普通用户
  githubId: Number,
  email: String,
  avatar: String
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

module.exports = mongoose.model('User',schema)
