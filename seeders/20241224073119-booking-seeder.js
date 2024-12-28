'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    const booking = {
      "id": 2,
      "name": "booking",
      "userId": 1,
      "roomId": 2,
      "startTime": 0,
      "endTime": 1,
      "startDate": new Date("2024-12-27"),
      "frequency": 2
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
