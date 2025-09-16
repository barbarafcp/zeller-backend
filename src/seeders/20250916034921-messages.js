'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Messages', [
      {
        text: 'Hablame sobre Toyota Corolla',
        role: 'client',
        sentAt: new Date(),
        clientId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Claro!',
        role: 'agent',
        sentAt: new Date(),
        clientId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Hablame sobre Chevrolet Onix',
        role: 'client',
        sentAt: new Date(new Date().setDate(new Date().getDate() - 8)),
        clientId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        text: 'Si!',
        role: 'agent',
        sentAt: new Date(new Date().setDate(new Date().getDate() - 8)),
        clientId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Messages', null, {});
  }
};
