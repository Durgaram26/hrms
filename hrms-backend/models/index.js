const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const sequelize = require('../config/db'); // Corrected path
const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(`Loading model: ${file}`);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    console.log(`Model name: ${model.name}, Is Sequelize Model: ${model.isPrototypeOf(Sequelize.Model)}`);
    db[model.name] = model;
  });

console.log('Models loaded into db object:', Object.keys(db));

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

console.log('Associations set up. Final db object keys:', Object.keys(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;