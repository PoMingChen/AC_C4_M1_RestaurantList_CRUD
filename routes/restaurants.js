const express = require('express')
const router = express.Router()

const db = require('../models')
const { literal } = require('sequelize');  // Import literal here
const restaurantList = db.restaurantlist

router.get('/', (req, res, next) => {
  const keyword = req.query.keyword?.trim().toLowerCase() || ''
  const sortOption = req.query.sort;  // Retrieve the sort option from the query
  const userId = req.user.id

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

  // Retrieve all restaurants for the user from the database
  restaurantList.findAll({
    order: order,
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { userId }, // Only show restaurants for this user
    raw: true
  })
    .then((restaurants) => {
      // Filter based on the keyword, if provided
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
      error.errorMessage = '資料取得失敗:(' // Set error message
      next(error) // Pass to error handler middleware
    })
})

router.get('/new', (req, res) => {
  return res.render('new')
})

// Fetch specific restaurant by ID and check access permissions
router.get('/:id', (req, res, next) => {
  // The req.params.id is used to access the id parameter within the route handler.
  const id = req.params.id
  const userId = req.user.id // Store the user.id from the deserialized req.user

  restaurantList.findByPk(id, {
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  })
    .then((restaurant) => {
      if (!restaurant) {
        req.flash('error', '找不到資料')
        return res.redirect('/restaurants')
      }

      // If the userId associated with this restaurant doesn't match the current logged-in user's userId (req.user.id), show an unauthorized error message
      if (restaurant.userId !== userId) {
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

router.post('/', (req, res, next) => { // don't forget to next parameter
  const formData = req.body
  const userId = req.user.id

  // Create a new record in the database using formData
  return restaurantList.create({ ...formData, userId }) // Use the spread operator

    .then(() => {
      req.flash('success', '新增成功!')
      return res.redirect('/restaurants')
    })
    .catch((error) => {
      error.errorMessage = '新增失敗:('
      next(error)
    })
})

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id
  const userId = req.user.id // Store the user.id from the deserialized req.user
  return restaurantList.findByPk(id, {
    attributes: { exclude: [] },
    raw: true
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
      res.render('edit', { restaurant })
    })
    .catch((error) => {
      error.errorMessage = '新增失敗:('
      next(error) // Pass error to next middleware
    })
})

router.put('/:id', (req, res, next) => {
  const id = req.params.id
  const updateData = req.body // Contains all the updated fields
  const userId = req.user.id // Store the user.id from the deserialized req.user

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

      //Make sure to use restaurant, not restaurantList, as this is an instance method.
      return restaurant.update(updateData)  // No need to write { where: { id } } since we already fetched it using findByPk earlier.
        .then(() => {
          req.flash('success', '更新成功!')
          return res.redirect(`/restaurants/${id}`)
        })
    })
    .catch((error) => {
      error.errorMessage = '更新失敗:('
      next(error)
    })

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
      if (restaurant.userId !== userId) {
        req.flash('error', '權限不足')
        return res.redirect('/restaurants')
      }

      //Make sure to use restaurant, not restaurantList, as this is an instance method.
      return restaurant.destroy()// No need to write { where: { id } } since we already fetched it using findByPk earlier.
        .then(() => {
          req.flash('success', '刪除成功!')
          return res.redirect('/restaurants')
        })
    })
    .catch((error) => {
      error.errorMessage = '刪除失敗:('
      next(error)
    })

})

module.exports = router