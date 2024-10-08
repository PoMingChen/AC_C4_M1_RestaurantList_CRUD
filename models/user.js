'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.restaurantlist)
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false, // email cannot be null
      unique: true, // email must be unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // password cannot be null
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};