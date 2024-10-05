module.exports = (error, req, res, next) => {
  console.error(error)
  console.log(req.flash);
  req.flash('error', error.errorMessage || '處理失敗:(')
  res.redirect('back')

  //next(error) 的作用是將錯誤傳遞給下一個錯誤處理 middleware，如果沒有其他錯誤處理 middleware 或路由，Express 會使用預設的錯誤處理機制來回應錯誤，這樣可以確保錯誤得到適當的捕獲和回應。
  next(error)
}
