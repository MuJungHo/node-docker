'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = {
      id: 1,
      name: "Admin",
      account: "Admin",
      password: hashedPassword,
      email: ""
    };

    const user = {
      id: 2,
      name: "User",
      account: "user",
      password: hashedPassword,
      email: ""
    }
    
    return queryInterface.bulkInsert("Users", [admin, user]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
