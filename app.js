const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;
const restaurantList = require('./public/jsons/restaurant.json').results;

app.engine('.hbs', engine({ extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static('public'));


app.get('/', (req, res) => {
  res.redirect('/restaurants')
})

app.get('/restaurants', (req, res) => {

  const keyword = req.query.keyword?.trim()
  const matchedRestaurants = keyword ? restaurantList.filter(restaurant => {
    return restaurant.name.toLowerCase().includes(keyword.toLowerCase()) || restaurant.category.toLowerCase().includes(keyword.toLowerCase())
  }) : restaurantList

  res.render('index', { restaurants: matchedRestaurants, keyword: keyword })
})

// The route '/restaurant/:id' captures the id parameter from the URL
app.get('/restaurants/:id', (req, res) => {

  // The req.params.id is used to access the id parameter within the route handler.
  id = req.params.id
  restaurant = restaurantList.find(restaurant => restaurant.id.toString() === id)
  res.render('detail', {restaurant, id})
})



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})