const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
})


module.exports = mongoose.model('Id',schema)