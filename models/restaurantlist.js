'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class restaurantlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  restaurantlist.init({
    name: DataTypes.STRING,
    name_en: DataTypes.STRING,
    category: DataTypes.STRING,
    image: DataTypes.STRING,
    location: DataTypes.STRING,
    phone: DataTypes.STRING,
    google_map: DataTypes.STRING,
    rating: DataTypes.DECIMAL,
    description: DataTypes.STRING,
    area:
    {
      type: DataTypes.STRING,
      defaultValue: '臺灣',
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'restaurantlist'
  })
  return restaurantlist
}
