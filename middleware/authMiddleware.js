const jwt = require('jsonwebtoken');

const authMiddleware =
  (roles = []) =>
  async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).send({ succes: false, message: `Access denied, token is required` });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);

      if (!roles.includes(decoded.role)) {
        return res.status(401).send({ succes: false, message: `Access denied, you can not access this route` });
      }
      
      req.userId = decoded.id;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).send({ succes: false, message: `Token has expired` });
      }
      return res.status(401).send({ succes: false, message: `Invalid token` });
    }
  };

module.exports = authMiddleware;
