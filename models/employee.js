import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employee = sequelize.define('Employee', {
  peopleId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'People',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'waiter',
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Employees',
      key: 'peopleId',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', // אם מנהל נמחק, העובדים תחתיו לא יימחקו אלא השדה יתאפס
  },
}, {
  tableName: 'Employees',
  timestamps: true,
});

export default Employee;