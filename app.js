const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')
const { engine } = require('express-handlebars')
const app = express()
const messageHandler = require('./middlewares/message-handler')
const errorHandler = require('./middlewares/error-handler')
const port = 3000
// const restaurantList = require('./public/jsons/restaurant.json').results; 
const methodOverride = require('method-override')

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

console.log('env', process.env.NODE_ENV)
console.log('env', process.env.SESSION_SECRET)
console.log('env', process.env.FACEBOOK_CLIENT_ID);
console.log('env', process.env.FACEBOOK_CLIENT_SECRET);

const router = require('./routes')

// Passport must be imported after loading environment variables; otherwise, FacebookStrategy won't find the environment variables.
const passport = require('./config/passport.js')

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
// Uses session as the source for authentication data, so users may remain logged in across requests. When a request is made, passport.session() activates the session mechanism and uses passport.deserializeUser() to retrieve logged-in user info from the session, attaching it to req.user. After login, req.user is available in all requests for accessing user information.
app.use(passport.session())

app.use(messageHandler)
app.get('/', (req, res) => {
  res.redirect('/register')
})
app.use(router)
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

