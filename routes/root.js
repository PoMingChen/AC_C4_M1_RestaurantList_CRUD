const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/', (req, res) => {
  res.render('index')
})
router.get('/register', (req, res) => {
  return res.render('register')
})
router.get('/login', (req, res) => {
  return res.render('login')
})
router.post('/login', passport.authenticate('local', {
  successRedirect: '/restaurants',
  failureRedirect: '/login',
  failureFlash: true
}))
router.post('/logout', (req, res) => {
  req.logout((error) => { //req.logout() 是 Passport.js 提供的方法，用來登出目前的使用者。這個方法會清除與該使用者相關的 session 資料，並取消已經建立的登入狀態。
    if (error) {
      next(error)
    }
    return res.redirect('/login')
  })
})
module.exports = router