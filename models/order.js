import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tableNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'received',
    validate: {
      isIn: [['received', 'in_progress', 'ready', 'paid', 'cancelled']],
    },
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'peopleId',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'People',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  tableName: 'Orders',
  timestamps: true,
});

export default Order;