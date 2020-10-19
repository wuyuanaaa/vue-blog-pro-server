import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  "delete":String,
  "filename":String,
  "hash":String,
  "height":Number,
  "ip":String,
  "path":String,
  "size":Number,
  "storename":String,
  "timestamp":Number,
  "url":String,
  "width":Number
});


export default mongoose.model('Img',schema)