const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

// 從 register.hbs 會取得使用者輸入的資料 (<form action="/users" method="POST">)
router.post('/', async (req, res, next) => { //Don't forget to add the `next` parameter here

  // Get user input from the request body
  console.log(req.body)
  const { name, email, password, confirmPassword } = req.body

  const findUser = await User.findOne({ where: { email } })

  // Check if any required fields are missing
  if (!email || !password || !confirmPassword) {

    const error = new Error() //
    error.errorMessage = 'email 及密碼為必填'
    return next(error) // Pass the error to the error handler. Note you don't need to use `return next(error)` and `return res.redirect('/register')` together. You only need one of them.
  } else if (password !== confirmPassword) {
    const error = new Error()
    error.errorMessage = '驗證密碼與密碼不符'
    return next(error)
  } else if (findUser) {
    // Check if the user already
    const error = new Error()
    error.errorMessage = 'email 已註冊'
    return next(error)
  }

  // 使用 .then() 接力處理 bcrypt.hash 和 User.create
  bcrypt.hash(password, 10)
    .then((hash) => {
      // 使用 hash 後的密碼創建新的使用者
      return User.create({ name, email, password: hash })
    })
    .then(() => {
      req.flash('success', '註冊成功！')
      return res.redirect('/login')
    })
    .catch((error) => {
      // 捕捉錯誤並處理
      console.error('Error creating user:', error)
      error.errorMessage = '新增失敗:('
      next(error)
    })

  // const hash = await bcrypt.hash(password, 10)

  // // Assuming everything is valid, you can continue with registration logic (e.g., saving the user to the database)
  // return await User.create({ name, email, password: hash })
  //   .then(() => {
  //     req.flash('success', '註冊成功！')
  //     return res.redirect('/login')
  //   })
  //   .catch((error) => {
  //     // Handle any other errors (e.g., database errors)
  //     error.errorMessage = '新增失敗:('
  //     next(error)
  //   })

})
module.exports = router