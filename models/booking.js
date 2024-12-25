'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Booking.init({
    name: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    roomId: DataTypes.INTEGER,
    startTime: DataTypes.DATE,
    endDate: DataTypes.DATE,
    frequency: DataTypes.INTEGER,
    interval: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Booking'
  });
  return Booking;
};