const express = require('express')
const router = express.Router()

const restaurants = require('./restaurants.js')

router.use('/restaurants', restaurants)

router.get('/', (req, res) => {
  res.render('index')
})

// 匯出路由器
module.exports = router