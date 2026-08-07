const bcrypt = require('bcrypt');
const env = require('../config/env');

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, env.bcrypt.saltRounds);

const comparePassword = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

module.exports = { hashPassword, comparePassword };
