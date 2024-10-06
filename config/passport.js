const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
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

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['email', 'displayName'] //指定你要取得使用者 Facebook 個人資訊的哪些欄位
}, (accessToken, refreshToken, profile, done) => { // (accessToken, refreshToken, profile, done) 就是 FacebookStrategy 的驗證函式，這個 callback function 會在 Passport 驗證流程中被呼叫
  const email = profile.emails[0].value
  const name = profile.displayName

  return User.findOne({ //使用 Sequelize 模組來尋找資料庫中是否有符合該電子郵件地址的使用者。若有，就直接回傳該使用者的資料；若沒有，就建立一個新的使用者。
    attributes: ['id', 'name', 'email'],
    where: { email },
    raw: true
  })
    .then((user) => {
      if (user) return done(null, user) // 如果使用者存在，就直接回傳該使用者的資料（回傳完整的 user 物件，可能不僅限於 id、name、email）

      const randomPwd = Math.random().toString(36).slice(-8) //toString 36 代表轉換成 36 進位(0-9 & a-z)，slice(-8) 代表取最後 8 個字元

      return bcrypt.hash(randomPwd, 10)
        .then((hash) => User.create({ name, email, password: hash })) //若使用者不存在，就建立一個新的使用者
        .then((user) => done(null, { id: user.id, name: user.name, email: user.email })) // 告訴 Passport 驗證流程已經完成，並將使用者的（id、name、email）屬性，傳給 Passport。之後 Passport 會將該使用者的資訊存入 session，接著可以透過 req.user 來取得使用者的資訊，在應用程式的其他部分使用。
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