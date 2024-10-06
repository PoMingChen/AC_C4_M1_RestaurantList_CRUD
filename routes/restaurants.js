const express = require('express')
const router = express.Router()

const db = require('../models')
const { literal } = require('sequelize');  // Import literal here
const restaurantList = db.restaurantlist

router.get('/', (req, res, next) => {
  const keyword = req.query.keyword?.trim().toLowerCase() || ''
  const sortOption = req.query.sort;  // Get the value of the 'sort' field from the query string
  const userId = req.user.id //新增這部分

  // Determine the sorting order based on the sortOption
  let order = [['name', 'ASC']];  // Default sorting order (A-Z);
  if (sortOption === 'nameAsc') {
    order = [['name', 'ASC']];  // Sort by name in ascending order (A-Z)
  } else if (sortOption === 'nameDesc') {
    order = [['name', 'DESC']];  // Sort by name in descending order (Z-A)
  } else if (sortOption === 'category') {
    order = [[literal(`
    CASE 
      WHEN category IS NULL THEN 9999
      WHEN category = '中東料理' THEN 1 
      WHEN category = '日本料理' THEN 2 
      WHEN category = '義式餐廳' THEN 3 
      WHEN category = '美式' THEN 4 
      WHEN category = '酒吧' THEN 5
      WHEN category = '咖啡' THEN 6
      ELSE 9998
    END ASC
  `)]];
  } else if (sortOption === 'area') {
    order = [[literal(`
    CASE 
      WHEN area IS NULL THEN 9999
      WHEN area = '臺北市' THEN 1 
      WHEN area = '新北市' THEN 2 
      WHEN area = '桃園市' THEN 3 
      WHEN area = '臺中市' THEN 4 
      WHEN area = '臺南市' THEN 5
      WHEN area = '高雄市' THEN 6
      WHEN area = '六都以外' THEN 7
      ELSE 9998
    END ASC
  `)]];
  }

  // Fetch all restaurants from the database
  restaurantList.findAll({
    order: order,
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { userId }, //每個人只能瀏覽到自己的 Todo
    raw: true
  })
    .then((restaurants) => {
      // Filter restaurants based on the keyword
      const matchedRestaurants = keyword
        ? restaurants.filter(restaurant => {
          return restaurant.name.toLowerCase().includes(keyword) ||
            restaurant.category.toLowerCase().includes(keyword)
        })
        : restaurants

      console.log('Sort option:', sortOption);
      console.log(keyword);

      res.render('index', { restaurants: matchedRestaurants, keyword, sortOption })  // Render the page with the matched restaurants
    })
    .catch((error) => {
      error.errorMessage = '資料取得失敗:('
      next(error)
    })
})

router.get('/new', (req, res) => {
  return res.render('new')
})

// The route '/restaurants/:id' captures the id parameter from the URL
router.get('/:id', (req, res, next) => {
  // The req.params.id is used to access the id parameter within the route handler.
  const id = req.params.id
  const userId = req.user.id //把 req.user 夾帶的（反序列化）的 user.id 放進來

  restaurantList.findByPk(id, {
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  })
    .then((restaurant) => {
      if (!restaurant) {
        req.flash('error', '找不到資料')
        return res.redirect('/restaurants')
      }
      if (restaurant.userId !== userId) { //如果這個 restaurant 其所屬的 userId，沒有跟當前登入的 userId(req.user.id) 一樣，就會跳出權限不足的錯誤訊息
        req.flash('error', '權限不足')
        return res.redirect('/restaurants')
      }
      res.render('detail', { restaurant })
    })
    .catch((error) => {
      error.errorMessage = '資料取得失敗:('
      next(error)
    })
})

router.post('/', (req, res, next) => { // don't forget to add next as the third argument
  const formData = req.body
  const userId = req.user.id

  // Create a new record in the database using formData
  return restaurantList.create({ ...formData, userId }) // Use the spread operator

    .then(() => {
      req.flash('success', '新增成功!')
      return res.redirect('/restaurants')
    })
    .catch((error) => {
      error.errorMessage = '新增失敗:(' //定義 error 物件裡面的 errorMessage attribute
      next(error)
    })
})

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id
  const userId = req.user.id //把 req.user 夾帶的（反序列化）的 user.id 放進來

  return restaurantList.findByPk(id, {
    attributes: { exclude: [] },
    raw: true
  })
    .then((restaurant) => {
      if (!restaurant) {
        req.flash('error', '找不到資料')
        return res.redirect('/restaurants')
      }
      if (restaurant.userId !== userId) { //如果這個 todo 其所屬的 userId，沒有跟當前登入的 userId(req.user.id) 一樣，就會跳出權限不足的錯誤訊息
        req.flash('error', '權限不足')
        return res.redirect('/restaurants')
      }
      res.render('edit', { restaurant })
    })
    .catch((error) => {
      error.errorMessage = '新增失敗:(' //定義 error 物件裡面的 errorMessage attribute
      next(error) //把 error 這個變數，傳入下一個 middleware，也就是 app.use(errorHandler)，那截止當前，app.use(errorHandler) 是最後一個 middleware，他會處理 flash message 後一層層經過剛才通過的 middleware 後，返還 response
    })
})

router.put('/:id', (req, res, next) => {
  const id = req.params.id
  const updateData = req.body // Contains all the updated fields
  const userId = req.user.id //把 req.user 夾帶的（反序列化）的 user.id 放進來

  return restaurantList.findByPk(id, {
    attributes: { exclude: [] }
  })
    .then((restaurant) => {
      if (!restaurant) {
        req.flash('error', '找不到資料')
        return res.redirect('/restaurants')
      }
      if (restaurant.userId !== userId) {
        req.flash('error', '權限不足')
        return res.redirect('/restaurants')
      }

      return restaurant.update(updateData) //不用再寫 { where: { id } }，因為我們已經在上面的 findByPk 撈出來了，所以這邊直接更新就好。注意這邊要用 restaurant，不是 restaurantList 因為是 instance method
        .then(() => {
          req.flash('success', '更新成功!')
          return res.redirect(`/restaurants/${id}`)
        })
    })
    .catch((error) => {
      error.errorMessage = '更新失敗:(' //定義 error 物件裡面的 errorMessage attribute
      next(error) //把 error 這個變數，傳入下一個 middleware，也就是 app.use(errorHandler)，那截止當前，app.use(errorHandler) 是最後一個 middleware，他會處理 flash message 後一層層經過剛才通過的 middleware 後，返還 response
    })

  // Ensure the ID is a number and validate/update only the fields that are present in req.body
  // restaurantList.update(updateData, { where: { id } })
  //   .then(() => res.redirect(`/restaurants/${id}`)) // Redirect to the updated restaurant details page
  //   .catch((err) => {
  //     console.error('Error updating restaurant:', err)
  //     res.status(500).send('Internal Server Error')
  //   })
})

router.delete('/:id', (req, res, next) => {
  const id = req.params.id
  const userId = req.user.id

  return restaurantList.findByPk(id, {
    attributes: { exclude: [] }
  })
    .then((restaurant) => {
      if (!restaurant) {
        req.flash('error', '找不到資料')
        return res.redirect('/restaurants')
      }
      if (restaurant.userId !== userId) { //在這裡更新權限比對
        req.flash('error', '權限不足')
        return res.redirect('/restaurants')
      }

      return restaurant.destroy() // 不用再寫 { where: { id } }，因為我們已經在上面的 findByPk 撈出來了，所以這邊直接刪除就好。注意這邊要用 restaurant，不是 restaurantList 因為是 instance method
        .then(() => {
          req.flash('success', '刪除成功!')
          return res.redirect('/restaurants')
        })
    })
    .catch((error) => {
      error.errorMessage = '刪除失敗:(' //定義 error 物件裡面的 errorMessage attribute
      next(error) //把 error 這個變數，傳入下一個 middleware，也就是 app.use(errorHandler)，那截止當前，app.use(errorHandler) 是最後一個 middleware，他會處理 flash message 後一層層經過剛才通過的 middleware 後，返還 response
    })

  // return restaurantList.destroy({ where: { id } })
  //   .then(() => res.redirect('/restaurants'))
})

module.exports = router