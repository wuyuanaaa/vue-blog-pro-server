import nodemailer from 'nodemailer'
import { emailSmtp } from '../config'

export const transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  service: '163', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  secureConnection: true, // 使用了 SSL
  auth: {
    user: 'blog_yuanaaa@163.com',
    // 这里密码不是qq密码，是你设置的smtp授权码
    pass: emailSmtp
  }
});