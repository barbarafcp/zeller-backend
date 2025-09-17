import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../db';

// Atributos
export interface MessageAttributes {
  id: number;
  text: string;
  role: string;
  sentAt: Date;
  clientId: number;
}

// Creacion atributos
interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public text!: string;
  public role!: string;
  public sentAt!: Date;
  public clientId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Message.belongsTo(models.Client, { foreignKey: 'clientId' });
  }
}

// Inicia el modelo
Message.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    text: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    sentAt: { type: DataTypes.DATE, allowNull: false },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Message', tableName: 'Messages' }
);

export default Message;
