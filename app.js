const express = require('express')
const flash = require('connect-flash') //新增
const session = require('express-session')
const path = require('path')
const { engine } = require('express-handlebars')
const app = express()
const messageHandler = require('./middlewares/message-handler')
const errorHandler = require('./middlewares/error-handler')
const port = 3000
// const restaurantList = require('./public/jsons/restaurant.json').results; //建立種子資料後，可以註解掉
const methodOverride = require('method-override')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

console.log('env', process.env.NODE_ENV)
console.log('env', process.env.SESSION_SECRET)
console.log('env', process.env.FACEBOOK_CLIENT_ID);
console.log('env', process.env.FACEBOOK_CLIENT_SECRET);

const router = require('./routes')
const passport = require('./config/passport.js') // 要在引入環境變數後才能引入 passport，不然 FacebookStrategy 會找不到環墮變數

app.engine('.hbs',
  engine({
    extname: '.hbs',
    helpers: {
      eq: (a, b) => a === b  // Custom 'eq' helper for equality check
    }
  }))

app.set('view engine', '.hbs')
app.set('views', './views')


app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

// Initialize sessions first before flash since flash message depends on sessions. Same logic for messageHandler.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize())
app.use(passport.session()) //使用 session 作為驗證的資料來源，啟用「登入保持狀態」功能，讓使用者在登入後可以保持登入狀態，並在整個應用程式中被識別為已驗證的使用者。 //後續請求時：passport.session() 會啟動 session 機制，並自動透過 passport.deserializeUser() 從 session 中取得已登入的使用者資訊，將其附加到 req.user。後續使用者在登入後，每個請求都可以透過 req.user 來存取使用者的資訊。

app.use(messageHandler)


//By placing the app.get('/') route before app.use(router), the server will first check for requests to /, and immediately perform the redirect to /restaurants. Therefore, the router module about restaurants will be triggered.
app.get('/', (req, res) => {
  // res.redirect('/restaurants')
  res.redirect('/register')
})


app.use(router)
app.use(errorHandler);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

