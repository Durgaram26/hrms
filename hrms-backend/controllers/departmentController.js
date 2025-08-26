const { Department } = require("../models");

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const newDepartment = await Department.create({ name, code, description });
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    await department.update({ name, code, description });
    res.json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    await department.destroy();
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 