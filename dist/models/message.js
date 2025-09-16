"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
class Message extends sequelize_1.Model {
    static associate(models) {
        Message.belongsTo(models.Client, { foreignKey: 'clientId' });
    }
}
exports.Message = Message;
// Initialize model
Message.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    text: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    role: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    sentAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    clientId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: db_1.sequelize, modelName: 'Message', tableName: 'Messages' });
exports.default = Message;
