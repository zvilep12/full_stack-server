import sequelize from '../config/database.js';

// 1. ייבוא כל המודלים הבודדים
import Person from './person.js';
import Employee from './employee.js';
import MenuItem from './menuItem.js';
import Order from './order.js';
import OrderItem from './orderItems.js';

// 2. הגדרת הקשרים (Associations)

// אדם <-> עובד (1:1)
Person.hasOne(Employee, { foreignKey: 'peopleId', onDelete: 'CASCADE' });
Employee.belongsTo(Person, { foreignKey: 'peopleId' });

// עובד (מנהל) <-> עובד (כפוף) - Self-Referencing (1:N)
Employee.hasMany(Employee, { foreignKey: 'managerId', as: 'subordinates' });
Employee.belongsTo(Employee, { foreignKey: 'managerId', as: 'manager' });

// עובד (מלצר) <-> הזמנה (1:N)
Employee.hasMany(Order, { foreignKey: 'employeeId' });
Order.belongsTo(Employee, { foreignKey: 'employeeId', as: 'waiter' });

// אדם (לקוח) <-> הזמנה (1:N)
Person.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Person, { foreignKey: 'customerId', as: 'customer' });

// הזמנה <-> מנה בתפריט (N:M דרך טבלת הציר OrderItems)
Order.belongsToMany(MenuItem, { through: OrderItem, foreignKey: 'orderId' });
MenuItem.belongsToMany(Order, { through: OrderItem, foreignKey: 'menuItemId' });

// 3. ייצוא החיבור וכל המודלים מרוכזים
export {
  sequelize,
  Person,
  Employee,
  MenuItem,
  Order,
  OrderItem,
};