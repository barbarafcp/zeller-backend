import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME!,       // database name
  process.env.DB_USERNAME!,   // username
  process.env.DB_PASSWORD!,   // password
  {
    host: process.env.DB_HOST!, // host
    dialect: 'postgres',        // your DB type
    logging: false,
  }
);
