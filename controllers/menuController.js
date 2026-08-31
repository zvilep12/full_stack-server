import { Op } from 'sequelize';
import { MenuItem } from '../models/db.js';

// Create Menu Item
export const createMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    // Basic validation
    if (!name || price === undefined || !category) {
      return res.status(400).json({ error: 'name, price, and category are required fields.' });
    }

    // Verify price is not negative
    if (Number(price) < 0) {
      return res.status(400).json({ error: 'Price cannot be a negative number.' });
    }

    const menuItem = await MenuItem.create({
      name,
      price,
      category,
      description,
      isAvailable: true
    });

    res.status(201).json(menuItem);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: `Menu item with name "${req.body.name}" already exists.` });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get All Menu Items
export const getAllMenuItems = async (req, res) => {
  try {
    const whereClause = {};
    if (req.query.category) {
      whereClause.category = req.query.category;
    }
    if (req.query.isAvailable !== undefined) {
      whereClause.isAvailable = req.query.isAvailable === 'true';
    }

    const menuItems = await MenuItem.findAll({ where: whereClause });
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Menu Items By Name (case-insensitive partial match)
export const getMenuItemByName = async (req, res) => {
  try {
    const { name } = req.params;
    const menuItems = await MenuItem.findAll({
      where: {
        name: {
          [Op.like]: `%${name}%`
        }
      }
    });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Menu Item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, isAvailable } = req.body;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({ error: `Menu item with ID ${id} not found.` });
    }

    if (price !== undefined && Number(price) < 0) {
      return res.status(400).json({ error: 'Price cannot be a negative number.' });
    }

    await menuItem.update({
      name,
      price,
      category,
      description,
      isAvailable
    });

    res.status(200).json(menuItem);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: `Menu item with name "${req.body.name}" already exists.` });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete Menu Item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({ error: `Menu item with ID ${id} not found.` });
    }

    await menuItem.destroy();
    res.status(200).json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Cannot delete menu item because it is associated with existing orders. Consider setting isAvailable to false instead.'
      });
    }
    res.status(500).json({ error: error.message });
  }
};

