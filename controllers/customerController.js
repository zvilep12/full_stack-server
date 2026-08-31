import { Op } from 'sequelize';
import { sequelize, Person, Employee, Order } from '../models/db.js';

// Create Customer
export const createCustomer = async (req, res) => {
  try {
    const { id, name, email, phone } = req.body;

    // Basic validation
    if (!id || !name || !email) {
      return res.status(400).json({ error: 'id, name, and email are required fields.' });
    }

    // Check if Person already exists
    const existingPerson = await Person.findByPk(id);
    if (existingPerson) {
      return res.status(400).json({ error: `Person with ID ${id} already exists.` });
    }

    // Create Customer (record in People only)
    const customer = await Person.create({
      id,
      name,
      email,
      phone,
      password: null // Customers do not have passwords
    });

    res.status(201).json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get All Customers (People who are NOT Employees)
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Person.findAll({
      include: [{
        model: Employee,
        required: false,
        attributes: []
      }],
      where: {
        '$Employee.peopleId$': null
      }
    });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Customer By ID (with order history)
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Person.findByPk(id, {
      include: [
        {
          model: Employee,
          required: false
        },
        {
          model: Order,
          required: false
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({ error: `Customer with ID ${id} not found.` });
    }

    // Ensure they are a customer and not an employee
    if (customer.Employee) {
      return res.status(400).json({ error: `Person with ID ${id} is an employee, not a customer.` });
    }

    // Clean up Employee field from response and return
    const customerData = customer.toJSON();
    delete customerData.Employee;

    res.status(200).json(customerData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    const customer = await Person.findByPk(id, { include: [Employee] });
    if (!customer) {
      return res.status(404).json({ error: `Customer with ID ${id} not found.` });
    }

    // Ensure they are a customer and not an employee
    if (customer.Employee) {
      return res.status(400).json({ error: `Person with ID ${id} is an employee, not a customer.` });
    }

    await customer.update({ name, email, phone });

    const updatedCustomer = customer.toJSON();
    delete updatedCustomer.Employee;

    res.status(200).json(updatedCustomer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete Customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Person.findByPk(id, { include: [Employee] });
    if (!customer) {
      return res.status(404).json({ error: `Customer with ID ${id} not found.` });
    }

    // Ensure they are a customer and not an employee
    if (customer.Employee) {
      return res.status(400).json({ error: `Person with ID ${id} is an employee, not a customer.` });
    }

    await customer.destroy();
    res.status(200).json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Customers By Name (case-insensitive partial match)
export const getCustomerByName = async (req, res) => {
  try {
    const { name } = req.params;
    const customers = await Person.findAll({
      include: [{
        model: Employee,
        required: false,
        attributes: []
      }],
      where: {
        '$Employee.peopleId$': null,
        name: {
          [Op.like]: `%${name}%`
        }
      }
    });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

