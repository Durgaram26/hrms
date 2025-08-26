const { Position, Department } = require("../models").sequelize.models;

exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.findAll({
      include: [{ model: Department, as: 'department', attributes: ['name'] }]
    });
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id, {
      include: [{ model: Department, as: 'department', attributes: ['name'] }]
    });
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.json(position);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPositionsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const positions = await Position.findAll({
      where: { departmentId: departmentId },
      include: [{ model: Department, as: 'department', attributes: ['name'] }]
    });
    if (!positions) {
      return res.status(404).json({ message: "No positions found for this department" });
    }
    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPosition = async (req, res) => {
  try {
    const { name, code, description, departmentId } = req.body;
    const newPosition = await Position.create({ name, code, description, departmentId });
    res.status(201).json(newPosition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const { name, code, description, departmentId } = req.body;
    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    await position.update({ name, code, description, departmentId });
    res.json(position);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }
    await position.destroy();
    res.json({ message: "Position deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 