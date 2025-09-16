"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("../config/config"));
dotenv_1.default.config();
const basename = path_1.default.basename(__filename);
const env = (process.env.NODE_ENV || 'development');
const config = config_1.default[env];
// Create Sequelize instance
const sequelize = config.use_env_variable
    ? new sequelize_1.Sequelize(process.env[config.use_env_variable], config)
    : new sequelize_1.Sequelize(config.database, config.username, config.password, config);
exports.sequelize = sequelize;
// DB object to hold models
const db = {
    sequelize,
    Sequelize: sequelize_1.Sequelize,
};
// Dynamically import all models
fs_1.default.readdirSync(__dirname)
    .filter(file => {
    return (file.indexOf('.') !== 0 &&
        file !== basename &&
        (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
        !file.endsWith('.test.ts'));
})
    .forEach(file => {
    const modelImport = require(path_1.default.join(__dirname, file));
    const model = modelImport.default || modelImport;
    if (typeof model.init === 'function') {
        model.init(model.tableAttributes || {}, { sequelize, modelName: model.name });
    }
    db[model.name] = model;
});
// Run associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
exports.default = db;
