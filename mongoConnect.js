import { mongoLink } from './config.js'
import mongoose from 'mongoose'

mongoose.set('useCreateIndex', true)
// 链接数据库
mongoose.connect(mongoLink,{ useNewUrlParser:true },function (err) {
  if(err){
    console.log('Connection Error:' + err)
  }else{
    console.log('Connection success!') }
});