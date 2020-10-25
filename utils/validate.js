const { validationResult } = require('express-validator') 


function validateHandler(req, res) {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return true
  }
  const array = errors.array()
  if (array.length === 1) {
    res.status(400).json({
      code: 0,
      data: array,
      msg: array[0].msg
    })
  } else {
    res.status(400).json({
      code: 0,
      data: array,
      msg: `${array[0].msg}等多条参数错误！`
    })
  }
  return false
}

module.exports = {
  validateHandler
}
