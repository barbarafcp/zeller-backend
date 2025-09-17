'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Debts', [
      {
        institution: 'Bank A',
        amount: 5000,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        clientId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Debts', null, {});
  }
};
