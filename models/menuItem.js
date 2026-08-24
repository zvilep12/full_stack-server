import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0, // מונע הזנת מחיר שלילי
    },
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'MenuItems',
  timestamps: true,
});

export default MenuItem;