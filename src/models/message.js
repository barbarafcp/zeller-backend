'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Message.belongsTo(models.Client, { foreignKey: 'clientId' });
    }
  }
  Message.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    text: {
      type:DataTypes.STRING,
      allowNull: false
    },
    role: {
      type:DataTypes.STRING,
      allowNull: false
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};