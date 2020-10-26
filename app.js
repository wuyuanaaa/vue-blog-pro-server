const createError = require('http-errors') 
const express = require('express')
const cookieParser = require('cookie-parser') 
const logger = require('morgan') 

const api = require('./api/index.js') 

const app = express()

// mongodb
const mongoConnect = require('./mongoConnect.js') 

mongoConnect()

// 加载日志的中间件
// 每一次服务请求都会将信息打印在控制台中
app.use(logger('dev'))


// 通过如下配置再路由种处理request时，可以直接获得post请求的body部分
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


app.use(cookieParser())


// 注册 api
api(app)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.json(500)
});

app.listen(3003)

module.exports = app
