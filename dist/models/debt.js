"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debt = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
// Model definition
class Debt extends sequelize_1.Model {
    // Associations
    static associate(models) {
        Debt.belongsTo(models.Client, { foreignKey: 'clientId' });
    }
}
exports.Debt = Debt;
// Initialize the model
Debt.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    institution: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    amount: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    dueDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    clientId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
}, { sequelize: db_1.sequelize, modelName: 'Debt', tableName: 'Debts' });
exports.default = Debt;
