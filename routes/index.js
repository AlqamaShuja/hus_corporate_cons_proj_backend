const authMiddleware = require('../middleware/authMiddleware');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const tikaServerRoutes = require('./tikaServerRoutes');

const API_PREFIX_V1 = `/api/v1`;
module.exports = (app) => {
  app.use(`${API_PREFIX_V1}/auth`, authRoutes);
  app.use(`${API_PREFIX_V1}/users`, userRoutes);
  app.use(`${API_PREFIX_V1}/tika`, tikaServerRoutes);
};