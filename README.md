# 🎉vue-blog-pro-server

## 可供参考的地方

- 基于 `express` 和 `mongdb` 的后端构建
- `jwt` 登陆
- `github` 授权登陆
- 七牛云图片存储对接
- 基于 `nodemailer` 的邮件发送 
- 基于 `express-validator` 的后端数据校验


## 使用方式

- clone 至本地

```
git clone https://github.com/wuyuanaaa/blog-pro-server.git
```

- 安装依赖

```
cd blog-pro-server
npm install
```

- 启动服务

__需要预先配置本地的 mongodb 服务器__

```
npm start
```

## 注意！

根目录的 `config-example.js` 为 `config.js` 的展示版本，内部数据都进行了替换 * 号处理，如果要正常运行项目，你需要

1. 替换 `config-example.js` 中的参数为真实参数
2. 修改 `config-example.js` 文件名为 `config.js`

## 更新记录

- 2020-10-23 新增 用户注册
- 2020-10-25 移除 bebal，ES6 相关  调整 部分接口
