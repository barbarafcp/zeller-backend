import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import configJson from '../config/config';

dotenv.config();

//  Configuración de Sequelize
const basename = path.basename(__filename);
const env = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';
const config = configJson[env];

const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable]!, config)
  : new Sequelize(config.database, config.username, config.password, config);

// Objeto que almacenará la conexión y todos los modelos cargados dinámicamente.
const db: { [key: string]: any; sequelize: Sequelize; Sequelize: typeof Sequelize } = {
  sequelize,
  Sequelize,
};

// Lee los archivos y carga dinámica de modelos
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
      !file.endsWith('.test.ts')
    );
  })
  .forEach(file => {
    const modelImport = require(path.join(__dirname, file));
    const model = modelImport.default || modelImport;
    if (typeof model.init === 'function') {
      model.init(model.tableAttributes || {}, { sequelize, modelName: model.name });
    }
    db[model.name] = model;
  });

// Ejecuta el método associate de cada modelo para definir relaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { sequelize };
export default db;