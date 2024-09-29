const express = require('express')
const router = express.Router()

const db = require('../models')
const { literal } = require('sequelize');  // Import literal here
const restaurantList = db.restaurantlist

router.get('/', (req, res) => {
  const keyword = req.query.keyword?.trim().toLowerCase() || ''
  const sortOption = req.query.sort;  // Get the value of the 'sort' field from the query string

  // Determine the sorting order based on the sortOption
  let order = [['name', 'ASC']];  // Default sorting order (A-Z);
  if (sortOption === 'nameAsc') {
    order = [['name', 'ASC']];  // Sort by name in ascending order (A-Z)
  } else if (sortOption === 'nameDesc') {
    order = [['name', 'DESC']];  // Sort by name in descending order (Z-A)
  } else if (sortOption === 'category') {
    // order = [['category', 'ASC']];  
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
    // order = [['area', 'ASC']];  
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
    raw: true
  })
    .then(restaurants => {
      // Filter restaurants based on the keyword
      const matchedRestaurants = keyword
        ? restaurants.filter(restaurant => {
          return restaurant.name.toLowerCase().includes(keyword) ||
            restaurant.category.toLowerCase().includes(keyword)
        })
        : restaurants

      console.log('Sort option:', sortOption);
      console.log(keyword);

      res.render('index', { restaurants: matchedRestaurants, keyword, sortOption })       // Render the page with the matched restaurants
    })
    .catch(error => {
      console.error('Error fetching restaurants:', error)
      res.status(500).send('Internal Server Error')
    })
})

router.get('/new', (req, res) => {
  return res.render('new')
})

// The route '/restaurants/:id' captures the id parameter from the URL
router.get('/:id', (req, res) => {
  // The req.params.id is used to access the id parameter within the route handler.
  id = req.params.id

  restaurantList.findByPk(id, {
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  })
    .then(restaurant => {
      res.render('detail', { restaurant })
    })
    .catch(error => {
      console.error('Error fetching restaurants:', error)
      res.status(500).send('Internal Server Error')
    })
})

router.post('/', (req, res) => {
  const formData = req.body

  // Create a new record in the database using formData
  return restaurantList.create(formData)
    .then(() => res.redirect('/restaurants'))
    .catch((err) => console.log(err))
})

router.get('/:id/edit', (req, res) => {
  const id = req.params.id

  return restaurantList.findByPk(id, {
    attributes: { exclude: [] },
    raw: true
  })
    .then((restaurant) => res.render('edit', { restaurant }))
})

router.put('/:id', (req, res) => {
  const id = req.params.id
  const updateData = req.body // Contains all the updated fields

  // Ensure the ID is a number and validate/update only the fields that are present in req.body
  restaurantList.update(updateData, { where: { id } })
    .then(() => res.redirect(`/restaurants/${id}`)) // Redirect to the updated restaurant details page
    .catch((err) => {
      console.error('Error updating restaurant:', err)
      res.status(500).send('Internal Server Error')
    })
})

router.delete('/:id', (req, res) => {
  const id = req.params.id

  return restaurantList.destroy({ where: { id } })
    .then(() => res.redirect('/restaurants'))
})

module.exports = router