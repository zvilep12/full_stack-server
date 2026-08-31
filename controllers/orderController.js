import { Op } from 'sequelize';
import { sequelize, Order, OrderItem, MenuItem, Employee, Person } from '../models/db.js';

// Create Order (Open Order for Table)
export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tableNumber, employeeId, customerId, items } = req.body;

    // Basic validation
    if (tableNumber === undefined || !employeeId || !items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'tableNumber, employeeId, and a non-empty items array are required.' });
    }

    if (Number(tableNumber) < 1) {
      await t.rollback();
      return res.status(400).json({ error: 'tableNumber must be a positive integer.' });
    }

    // Verify Waiter
    const waiter = await Employee.findByPk(employeeId, { include: [Person] });
    if (!waiter) {
      await t.rollback();
      return res.status(404).json({ error: `Employee with ID ${employeeId} not found.` });
    }
    if (!waiter.isActive) {
      await t.rollback();
      return res.status(400).json({ error: `Employee ${waiter.Person.name} is currently inactive.` });
    }

    // Verify Customer (if provided)
    if (customerId) {
      const customerPerson = await Person.findByPk(customerId, { include: [Employee] });
      if (!customerPerson) {
        await t.rollback();
        return res.status(404).json({ error: `Customer with ID ${customerId} not found.` });
      }
      if (customerPerson.Employee) {
        await t.rollback();
        return res.status(400).json({ error: `Person with ID ${customerId} is an employee, not a customer.` });
      }
    }

    // Calculate total amount and verify items
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      if (!item.menuItemId || item.quantity === undefined) {
        await t.rollback();
        return res.status(400).json({ error: 'Each item must have a menuItemId and quantity.' });
      }

      const dish = await MenuItem.findByPk(item.menuItemId);
      if (!dish) {
        await t.rollback();
        return res.status(404).json({ error: `Menu item with ID ${item.menuItemId} not found.` });
      }
      if (!dish.isAvailable) {
        await t.rollback();
        return res.status(400).json({ error: `Menu item "${dish.name}" is currently unavailable.` });
      }

      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity < 1) {
        await t.rollback();
        return res.status(400).json({ error: `Quantity for item "${dish.name}" must be a positive integer.` });
      }

      const priceAtOrder = dish.price;
      totalAmount += priceAtOrder * quantity;

      processedItems.push({
        menuItemId: item.menuItemId,
        quantity,
        priceAtOrder,
        notes: item.notes || null
      });
    }

    // Create Order
    const order = await Order.create({
      tableNumber,
      status: 'received',
      totalAmount,
      employeeId,
      customerId: customerId || null
    }, { transaction: t });

    // Create Order Items
    const orderItemsData = processedItems.map(item => ({
      orderId: order.id,
      ...item
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    await t.commit();

    // Fetch full order details to return
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const whereClause = {};
    if (req.query.status) {
      whereClause.status = req.query.status;
    }
    if (req.query.tableNumber) {
      whereClause.tableNumber = req.query.tableNumber;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Order By ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    // Validate Status values
    const allowedStatuses = ['received', 'in_progress', 'ready', 'paid', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    await order.update({ status });

    // Return the updated order with full includes
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Order (Cancel/Remove)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    // Cascades delete to OrderItems
    await order.destroy();
    res.status(200).json({ message: `Order ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Orders By Customer Name (case-insensitive partial match)
export const getOrdersByCustomerName = async (req, res) => {
  try {
    const { name } = req.params;
    const orders = await Order.findAll({
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          where: {
            name: {
              [Op.like]: `%${name}%`
            }
          },
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Dish to Existing Order (POST /orders/:id/items)
export const addOrderItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { menuItemId, quantity, notes } = req.body;

    if (!menuItemId || quantity === undefined) {
      await t.rollback();
      return res.status(400).json({ error: 'menuItemId and quantity are required.' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) {
      await t.rollback();
      return res.status(400).json({ error: 'Quantity must be a positive integer.' });
    }

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    const closedStatuses = ['paid', 'cancelled'];
    if (closedStatuses.includes(order.status)) {
      await t.rollback();
      return res.status(400).json({ error: `Cannot add items to an order that is already ${order.status}.` });
    }

    const dish = await MenuItem.findByPk(menuItemId, { transaction: t });
    if (!dish) {
      await t.rollback();
      return res.status(404).json({ error: `Menu item with ID ${menuItemId} not found.` });
    }
    if (!dish.isAvailable) {
      await t.rollback();
      return res.status(400).json({ error: `Menu item "${dish.name}" is currently unavailable.` });
    }

    const priceAtOrder = dish.price;
    const addedAmount = priceAtOrder * qty;

    const existingItem = await OrderItem.findOne({
      where: { orderId: id, menuItemId },
      transaction: t
    });

    if (existingItem) {
      await existingItem.update({
        quantity: existingItem.quantity + qty,
        notes: notes !== undefined ? notes : existingItem.notes
      }, { transaction: t });
    } else {
      await OrderItem.create({
        orderId: id,
        menuItemId,
        quantity: qty,
        priceAtOrder,
        notes: notes || null
      }, { transaction: t });
    }

    await order.update({
      totalAmount: order.totalAmount + addedAmount
    }, { transaction: t });

    await t.commit();

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Update Dish in Existing Order (PUT /orders/:id/items/:menuItemId)
export const updateOrderItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, menuItemId } = req.params;
    const { quantity, notes } = req.body;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    const closedStatuses = ['paid', 'cancelled'];
    if (closedStatuses.includes(order.status)) {
      await t.rollback();
      return res.status(400).json({ error: `Cannot update items in an order that is already ${order.status}.` });
    }

    const orderItem = await OrderItem.findOne({
      where: { orderId: id, menuItemId },
      transaction: t
    });
    if (!orderItem) {
      await t.rollback();
      return res.status(404).json({ error: `Menu item ${menuItemId} is not in order ${id}.` });
    }

    let amountDifference = 0;
    const updateData = {};

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (isNaN(newQty) || newQty < 1) {
        await t.rollback();
        return res.status(400).json({ error: 'Quantity must be a positive integer.' });
      }
      const qtyDiff = newQty - orderItem.quantity;
      amountDifference = qtyDiff * orderItem.priceAtOrder;
      updateData.quantity = newQty;
    }

    await orderItem.update(updateData, { transaction: t });

    if (amountDifference !== 0) {
      await order.update({
        totalAmount: order.totalAmount + amountDifference
      }, { transaction: t });
    }

    await t.commit();

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Remove Dish from Existing Order (DELETE /orders/:id/items/:menuItemId)
export const deleteOrderItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, menuItemId } = req.params;

    const order = await Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    const closedStatuses = ['paid', 'cancelled'];
    if (closedStatuses.includes(order.status)) {
      await t.rollback();
      return res.status(400).json({ error: `Cannot remove items from an order that is already ${order.status}.` });
    }

    const orderItem = await OrderItem.findOne({
      where: { orderId: id, menuItemId },
      transaction: t
    });
    if (!orderItem) {
      await t.rollback();
      return res.status(404).json({ error: `Menu item ${menuItemId} is not in order ${id}.` });
    }

    const amountDeducted = orderItem.priceAtOrder * orderItem.quantity;

    await orderItem.destroy({ transaction: t });

    await order.update({
      totalAmount: Math.max(0, order.totalAmount - amountDeducted)
    }, { transaction: t });

    await t.commit();

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'waiter',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Person,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: MenuItem,
          through: {
            attributes: ['quantity', 'priceAtOrder', 'notes']
          }
        }
      ]
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

