const express = require('express')
const router = express.Router()

const root = require('./root.js')
const users = require('./users')
const restaurants = require('./restaurants.js')

router.use('/', root) // // This makes all root routes accessible at the base level
router.use('/restaurants', restaurants)
router.use('/users', users)

// we have setted the ` res.redirect('/register')` in the app.js, so we don't need to set it here
// router.get('/', (req, res) => {
//   res.render('register')
// })

module.exports = router