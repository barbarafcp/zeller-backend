'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Clients', [
      {
      name: 'John Doe',
      rut: '12345678-9',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Jane Doe',
      rut: '98765432-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Clients', null, {});
  }
};
