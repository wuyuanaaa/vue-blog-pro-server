const { mongoLink } = require('./config.js') 
const mongoose = require('mongoose')

mongoose.set('useCreateIndex', true)
// 链接数据库


module.exports = function() {
  mongoose.connect(mongoLink,{ useNewUrlParser:true, useUnifiedTopology: true },function (err) {
    if(err){
      console.log('Connection Error:' + err)
    }else{
      console.log('Connection success!') }
  })
}