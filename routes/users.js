const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

// Data from user input is received from register.hbs (<form action="/users" method="POST">)
router.post('/', async (req, res, next) => {

  // Get user input from the request body
  console.log(req.body)
  const { name, email, password, confirmPassword } = req.body

  const findUser = await User.findOne({ where: { email } })

  // Check if any required fields are missing
  if (!email || !password || !confirmPassword) {

    // you don't need to use `return next(error)` and `return res.redirect('/register')` together. You only need one of them.
    const error = new Error() //
    error.errorMessage = 'email 及密碼為必填'
    return next(error)
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

  bcrypt.hash(password, 10)
    .then((hash) => {
      // Create a new user with the hashed password
      return User.create({ name, email, password: hash })
    })
    .then(() => {
      req.flash('success', '註冊成功！')
      return res.redirect('/login')
    })
    .catch((error) => {
      console.error('Error creating user:', error)
      error.errorMessage = '新增失敗:('
      next(error)
    })
})
module.exports = router