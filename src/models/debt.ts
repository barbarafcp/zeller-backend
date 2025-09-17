import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../db';

// Atributos
export interface DebtAttributes {
  id: number;
  institution: string;
  amount: number;
  dueDate: Date;
  clientId: number;
}

// Atributos requeridos para crear una nueva fila
interface DebtCreationAttributes extends Optional<DebtAttributes, 'id'> {}

// Model definition
export class Debt extends Model<DebtAttributes, DebtCreationAttributes> implements DebtAttributes {
  public id!: number;
  public institution!: string;
  public amount!: number;
  public dueDate!: Date;
  public clientId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Asociaciones
  public static associate(models: any) {
    Debt.belongsTo(models.Client, { foreignKey: 'clientId' });
  }
}

// Inicia el modelo
Debt.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    institution: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Debt', tableName: 'Debts' }
);

export default Debt;
