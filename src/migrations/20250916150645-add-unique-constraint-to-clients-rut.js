'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('Clients', {
      fields: ['rut'],
      type: 'unique',
      name: 'unique_rut_constraint'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Clients', 'unique_rut_constraint');
  }
};
