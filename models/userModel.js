import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username: String,
  password: String,
  nickname: String,
  role: Number,
  githubId: Number,
  email: String,
  avatar: String
})

schema.options.toJSON = {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id
    delete ret._id
  }
}

export default mongoose.model('User',schema)
