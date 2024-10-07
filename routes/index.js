const express = require('express')
const router = express.Router()

const root = require('./root.js')
const users = require('./users.js')
const oauth = require('./oauth.js')
const restaurants = require('./restaurants.js')
const authHandler = require('../middlewares/auth-handler')

router.use('/', root) // makes all root routes accessible at the base level
router.use('/oauth', oauth)
router.use('/restaurants', authHandler, restaurants)
router.use('/users', users)

module.exports = router