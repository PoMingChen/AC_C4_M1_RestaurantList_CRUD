'use strict'

const restaurantList = require('../public/jsons/restaurant.json').results

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('restaurantlists', restaurantList.map(item => ({
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
      // This object represents the current date and time when the Date constructor is called.
      // Date() is JS built-in class.
      createdAt: new Date(),
      updatedAt: new Date()
    })), {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('restaurantlists', null, {})
  }
}
