const express = require('express')
const path = require('path')
const { engine } = require('express-handlebars')
const app = express()
const router = require('./routes')
const port = 3000
// const restaurantList = require('./public/jsons/restaurant.json').results; //建立種子資料後，可以註解掉
const methodOverride = require('method-override')

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


//By placing the app.get('/') route before app.use(router), the server will first check for requests to /, and immediately perform the redirect to /restaurants. Therefore, the router module about restaurants will be triggered.
app.get('/', (req, res) => {
  // res.redirect('/restaurants')
  res.redirect('/register')
})

app.use(router)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

