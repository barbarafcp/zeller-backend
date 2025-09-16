"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
class Client extends sequelize_1.Model {
    static associate(models) {
        Client.hasMany(models.Message, { foreignKey: 'clientId' });
        Client.hasMany(models.Debt, { foreignKey: 'clientId' });
    }
}
exports.Client = Client;
// Initialize model
Client.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    rut: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
}, { sequelize: db_1.sequelize, modelName: 'Client', tableName: 'Clients' });
exports.default = Client;
