'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const booking = {
      "id": 8,
      "name": "booking",
      "userId": 1,
      "roomId": 1,
      "startTime": new Date(2024, 10, 7, 14, 30),
      "endDate": new Date(2025, 10, 7),
      "frequency": 1,
      "interval": 60
    };

    return queryInterface.bulkInsert("Bookings", [booking]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
