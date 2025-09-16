import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../db';
import { MessageAttributes } from './message';
import { DebtAttributes } from './debt';

// Attributes
interface ClientAttributes {
  id: number;
  name: string;
  rut: string;
}

// Creation attributes
interface ClientCreationAttributes extends Optional<ClientAttributes, 'id'> {
  Messages?: Partial<MessageAttributes>[];
  Debts?: Partial<DebtAttributes>[]; 
}

export class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id!: number;
  public name!: string;
  public rut!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Client.hasMany(models.Message, { foreignKey: 'clientId' });
    Client.hasMany(models.Debt, { foreignKey: 'clientId' });
  }
}

// Initialize model
Client.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    rut: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: 'Client', tableName: 'Clients' }
);

export default Client;
