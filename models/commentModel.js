const mongoose = require('mongoose')
// import Article from './articleModel'

var schema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  superior: String,
  content: {
    type: String,
    trim: true
  },
  follow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

schema.options.toJSON = {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id
    delete ret._id
  }
}


module.exports = mongoose.model('Comment', schema);
