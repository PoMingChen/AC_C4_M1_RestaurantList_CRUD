'use strict';
const restaurantList = require('../public/jsons/restaurant.json').results
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash('12345678', salt)  // Hash '12345678' here

      // Backup existing data
      const existingUsers = await queryInterface.sequelize.query('SELECT * FROM Users', { type: Sequelize.QueryTypes.SELECT });
      const existingRestaurants = await queryInterface.sequelize.query('SELECT * FROM restaurantlists', { type: Sequelize.QueryTypes.SELECT });


      // Delete existing data
      await queryInterface.bulkDelete('restaurantlists', null, { transaction });
      await queryInterface.bulkDelete('Users', null, { transaction });


      // Insert users
      await queryInterface.bulkInsert('Users', [
        {
          id: 1,
          name: 'user1',
          email: 'user1@example.com',
          password: hash,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'user2',
          email: 'user2@example.com',
          password: hash,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
        { transaction }
      )

      // Prepare restaurant data with user IDs
      const restaurantsWithUserIds = restaurantList.map((item, index) => {
        let userId = null;

        // Assign user IDs based on the index of the restaurant
        if (index < 3) {
          userId = 1; // User1 for restaurant 1, 2, 3
        } else if (index >= 3 && index < 6) {
          userId = 2; // User2 for restaurant 4, 5, 6
        } else {
          userId = null; // No user assigned for restaurant 7, 8
        }

        return {
          id: item.id,
          name: item.name,
          name_en: item.name_en,
          category: item.category,
          image: item.image,
          location: item.location,
          phone: item.phone,
          google_map: item.google_map,
          rating: item.rating,
          description: item.description,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: userId, // Set the userId based on the restaurant index
          area: item.area || '臺灣'
        }
      });

      await queryInterface.bulkInsert('restaurantlists',
        restaurantsWithUserIds,
        { transaction }
      )

      await transaction.commit()
    } catch (error) {
      if (transaction) await transaction.rollback()
      throw error; // Re-throw the error to ensure proper error handling
    }
  },

  async down(queryInterface, Sequelize) {
    let transaction;

    try {
      transaction = await queryInterface.sequelize.transaction();

      // Restore existing data
      await queryInterface.bulkInsert('Users', existingUsers, { transaction });
      await queryInterface.bulkInsert('restaurantlists', existingRestaurants, { transaction });

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error; // Re-throw the error to ensure proper error handling
    }
  }
};


