import dotenv from 'dotenv';
dotenv.config();

interface SequelizeConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql';
  use_env_variable?: string;
}

interface Config {
  development: SequelizeConfig;
  test: SequelizeConfig;
  production: SequelizeConfig;
}

const config: Config = {
  development: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    dialect: 'postgres',
  },
  test: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    dialect: 'postgres',
  },
  production: {
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    dialect: 'postgres',
  },
};

export default config;
