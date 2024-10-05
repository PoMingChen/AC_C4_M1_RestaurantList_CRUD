//最後也要 export，app.js 才可以取用
module.exports = (req, res, next) => {
  res.locals.success_msg = req.flash('success')
  res.locals.error_msg = req.flash('error')

  next()
}