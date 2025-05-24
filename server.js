require("dotenv").config();
const express = require('express');
const cors = require('cors');
const allRoutes = require("./routes/index");
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require("./models/index");
const swaggerSpec = require('./swagger/swagger');
const logReqBody = require("./middleware/logRequest");


//
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(logReqBody);

// DB Connection and Seeding
sequelize.sync().then(() => {
  console.log("Database Connected.!!");
}).catch(() => {
  console.error("Error in Connecting Database.!!");
});

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
allRoutes(app);

// Start the server
const PORT = process.env.PORT || 5007;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API DOCS: http://localhost:5007/api-docs`);
});