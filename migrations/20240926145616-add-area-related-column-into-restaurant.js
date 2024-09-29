'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'restaurantlists',
      'area',
      {
        type: Sequelize.STRING,
        defaultValue: '臺灣',
        allowNull: true
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'restaurantlists',
      'area'
    )
  }
};
