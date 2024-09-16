const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const app = express();
const port = 3000;
// const restaurantList = require('./public/jsons/restaurant.json').results; //建立種子資料後，可以註解掉
const db = require('./models')
const restaurantList = db.restaurantlist
const methodOverride = require('method-override') 


app.engine('.hbs', engine({ extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method')); 

app.get('/', (req, res) => {
  res.redirect('/restaurants') 
})

app.get('/restaurants/new', (req, res) => {
  return res.render('new')
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

// The route '/restaurants/:id' captures the id parameter from the URL
app.get('/restaurants/:id', (req, res) => {

  // The req.params.id is used to access the id parameter within the route handler.
  id = req.params.id

  restaurantList.findByPk(id,{
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    raw: true
  })
  .then(restaurant => {
    res.render('detail', {restaurant})
  })
  .catch(error => {
    console.error('Error fetching restaurants:', error);
    res.status(500).send('Internal Server Error');
  });
})

app.post('/restaurants', (req, res) => {
  const formData = req.body; 

  // Create a new record in the database using formData
  return restaurantList.create(formData)
    .then(() => res.redirect('/restaurants'))
    .catch((err) => console.log(err));
})

app.get('/restaurants/:id/edit', (req, res) => {
	const id = req.params.id

	return restaurantList.findByPk(id, {
		attributes: { exclude: [] },
		raw: true
	})
		.then((restaurant) => res.render('edit', { restaurant }))
})

app.put('/restaurants/:id', (req, res) => {
  const id = req.params.id;
  const updateData = req.body; // Contains all the updated fields

  // Ensure the ID is a number and validate/update only the fields that are present in req.body
  restaurantList.update(updateData, { where: { id } })
    .then(() => res.redirect(`/restaurants/${id}`)) // Redirect to the updated restaurant details page
    .catch((err) => {
      console.error('Error updating restaurant:', err);
      res.status(500).send('Internal Server Error');
    }); 
})

app.delete('/restaurants/:id', (req, res) => {
	const id = req.params.id

	return restaurantList.destroy({ where: { id }})
		.then(() => res.redirect('/restaurants'))
})




app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})