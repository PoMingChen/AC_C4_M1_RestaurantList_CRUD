const express = require('express')
const router = express.Router()

const db = require('../models')
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
    order = [['category', 'ASC']];  // Sort by name in descending order (Z-A)
  } else if (sortOption === 'area') {
    order = [['area', 'ASC']];  // Sort by name in descending order (Z-A)
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