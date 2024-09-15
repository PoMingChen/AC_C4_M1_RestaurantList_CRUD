const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;
// const restaurantList = require('./public/jsons/restaurant.json').results; //順利建立後，可以註解掉
const db = require('./models')
const restaurantList = db.restaurantlist


app.engine('.hbs', engine({ extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static('public'));


app.get('/', (req, res) => {
  // res.redirect('/restaurants')
  return restaurantList.findAll() //非同步語法
		.then((restaurantList) => res.send({ restaurantList }))
		.catch((err) => res.status(422).json(err))
})

app.get('/restaurants', (req, res) => {
  const keyword = req.query.keyword?.trim().toLowerCase() || '';

  // Fetch all restaurants from the database
  restaurantList.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  })
  .then(restaurants => {
    // Filter restaurants based on the keyword
    const matchedRestaurants = keyword ? restaurants.filter(restaurant => {
      return restaurant.name.toLowerCase().includes(keyword) || 
             restaurant.category.toLowerCase().includes(keyword);
    }) : restaurants;

    // Render the page with the matched restaurants
    res.render('index', { restaurants: matchedRestaurants, keyword });
  })
  .catch(error => {
    console.error('Error fetching restaurants:', error);
    res.status(500).send('Internal Server Error');
  });
})

// The route '/restaurant/:id' captures the id parameter from the URL
// app.get('/restaurants/:id', (req, res) => {

//   // The req.params.id is used to access the id parameter within the route handler.
//   id = req.params.id
//    // Fetch all restaurants from the database
//    restaurantList.findByPk(id,{
//     attributes: { exclude: ['createdAt', 'updatedAt'] },
//     raw: true
//   })
//   .then(restaurant => {
//     res.render('detail', {restaurant, id})
//   })
//   .catch(error => {
//     console.error('Error fetching restaurants:', error);
//     res.status(500).send('Internal Server Error');
//   });
// })



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})