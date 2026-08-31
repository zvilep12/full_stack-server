import { Op } from 'sequelize';
import { sequelize, Person, Employee } from '../models/db.js';

// Create Employee (Register)
export const createEmployee = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, name, email, role, managerId, phone, password } = req.body;

    // Basic validation
    if (!id || !name || !email) {
      return res.status(400).json({ error: 'id, name, and email are required fields.' });
    }

    // Check if Person already exists
    const existingPerson = await Person.findByPk(id);
    if (existingPerson) {
      return res.status(400).json({ error: `Person with ID ${id} already exists.` });
    }

    // Create Person
    const person = await Person.create({
      id,
      name,
      email,
      phone,
      password
    }, { transaction: t });

    // Create Employee
    await Employee.create({
      peopleId: person.id,
      role: role || 'waiter',
      managerId: managerId || null,
      isActive: true
    }, { transaction: t });

    await t.commit();

    // Fetch the fully created employee details to return
    const createdEmployee = await Employee.findByPk(person.id, {
      include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
    });

    res.status(201).json(createdEmployee);
  } catch (error) {
    await t.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get All Employees
export const getAllEmployees = async (req, res) => {
  try {
    const whereClause = {};
    if (req.query.role) {
      whereClause.role = req.query.role;
    }
    if (req.query.isActive !== undefined) {
      whereClause.isActive = req.query.isActive === 'true';
    }

    const employees = await Employee.findAll({
      where: whereClause,
      include: [{
        model: Person,
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Employee By ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id, {
      include: [
        {
          model: Person,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Employee,
          as: 'subordinates',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        },
        {
          model: Employee,
          as: 'manager',
          include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ error: `Employee with ID ${id} not found.` });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Employee
export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password, role, isActive, managerId } = req.body;

  const employee = await Employee.findByPk(id);
  if (!employee) {
    return res.status(404).json({ error: `Employee with ID ${id} not found.` });
  }

  const t = await sequelize.transaction();
  try {
    // Update Person
    await Person.update({
      name,
      email,
      phone,
      password
    }, {
      where: { id },
      transaction: t
    });

    // Update Employee
    await Employee.update({
      role,
      isActive,
      managerId
    }, {
      where: { peopleId: id },
      transaction: t
    });

    await t.commit();

    // Retrieve updated employee
    const updatedEmployee = await Employee.findByPk(id, {
      include: [{ model: Person, attributes: ['id', 'name', 'email', 'phone'] }]
    });

    res.status(200).json(updatedEmployee);
  } catch (error) {
    await t.rollback();
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await Person.findByPk(id);
    if (!person) {
      return res.status(404).json({ error: `Employee with ID ${id} not found.` });
    }

    // Delete the Person, which cascades to Employee
    await person.destroy();
    res.status(200).json({ message: 'Employee deleted' });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Cannot delete employee because they are associated with existing orders. Consider setting isActive to false instead.'
      });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get Employees By Name (case-insensitive partial match)
export const getEmployeeByName = async (req, res) => {
  try {
    const { name } = req.params;
    const employees = await Employee.findAll({
      include: [{
        model: Person,
        where: {
          name: {
            [Op.like]: `%${name}%`
          }
        },
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

