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
    startTime: DataTypes.INTEGER,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    startDateTime: DataTypes.DATE,
    endDateTime: DataTypes.DATE,
    frequency: DataTypes.ENUM("once", "daily", "monthly", "weekly"),
    dates: DataTypes.ARRAY(DataTypes.DATEONLY),
    monthdates: DataTypes.ARRAY(DataTypes.INTEGER),
    weekdays: DataTypes.ARRAY(DataTypes.INTEGER),
  }, {
    sequelize,
    modelName: 'Booking'
  });
  return Booking;
};