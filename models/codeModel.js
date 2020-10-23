import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  code: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Code', schema)
