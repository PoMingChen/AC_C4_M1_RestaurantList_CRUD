const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy({ usernameField: 'email' }, (username, password, done) => { //(username, password, done) 就是 LocalStrategy 的驗證函式，這個 callback function 會在 Passport 驗證流程中被呼叫
  return User.findOne({
    attributes: ['id', 'name', 'email', 'password'],
    where: { email: username },
    raw: true
  })
    .then((user) => {

      //不可以寫  if (!user || password !== user.password)，因為前者是使用者明文輸入的，後者已經是資料庫中的雜湊值，兩者無法直接比對，會導致 !== 成立，使得若使用者輸入正確的密碼，也會被判定為錯誤，因為 return done(null, false, { message: 'email 或密碼錯誤' }) 會被執行
      if (!user) {
        return done(null, false, { message: '使用者 email 不存在' })
      }
      return bcrypt.compare(password, user.password) //第一個參數放入要比對的明文，第二個參數則是資料庫中的雜湊值
        .then((isMatch) => {
          if (!isMatch) {
            return done(null, false, { message: 'email 或密碼錯誤' })
          }

          return done(null, user)
        })
    })
    .catch((error) => {
      error.errorMessage = '登入失敗'
      done(error)
    })
}))

//第一個參數 user 是驗證通過的使用者物件，這個物件是從前面的 done(null, user) 傳遞過來的。
//第二個參數 done 是序列化過程的回調函數。你可以選擇將使用者物件中的某些部分（通常是使用者 ID 或其他標識符）存入 session，而不是整個使用者物件。
passport.serializeUser((user, done) => {
  const { id, name, email } = user
  return done(null, { id, name, email }) //只有 id, name, email 會被存入 session（password 不會）
})

passport.deserializeUser((user, done) => {
  done(null, { id: user.id })
})

module.exports = passport