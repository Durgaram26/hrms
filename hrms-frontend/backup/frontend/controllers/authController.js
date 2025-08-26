const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Employee } = require("../models"); // Corrected import
const resetTokens = {}; // in-memory

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role });
    res.status(201).json({ email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    // Find the employee associated with the user's email
    const employee = await Employee.findOne({ where: { email: user.email } });
    const employeeId = employee ? employee.id : null;

    const token = jwt.sign({ id: user.id, role: user.role, employeeId: employeeId }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "Not found" });
  const token = crypto.randomBytes(32).toString("hex");
  resetTokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 };
  const link = `http://localhost:5173/reset-password/${token}`;
  res.json({ message: "Reset link sent", resetLink: link });
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const data = resetTokens[token];
  if (!data || Date.now() > data.expires) return res.status(400).json({ message: "Token expired" });
  const user = await User.findOne({ where: { email: data.email } });
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  delete resetTokens[token];
  res.json({ message: "Password reset successful" });
};

