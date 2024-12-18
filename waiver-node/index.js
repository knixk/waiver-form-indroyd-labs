const express = require("express");
const app = express();
const port = process.env.PORT || 5050;
const cors = require("cors");
const env = require("dotenv");
const fs = require("fs");
// DB Connection fn
const { connectToDatabase } = require("./connectDB.js");  
// All the routes
const myRouter = require("./routes/routes");
// const serverless = require("serverless-http");

// use the db
(async () => {
  try {
    const dbConnection = await connectToDatabase();
    console.log("Database connected successfully");
    // You can now use dbConnection
  } catch (err) {
    console.error(err.message);
  }
})();

app.use(async (req, res, next) => {
  try {
    if (!global.dbConnection) {
      global.dbConnection = await connectToDatabase(); // Wait for connection
    }
    req.db = global.dbConnection; // Pass connection to routes
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// console.log(router);

env.config();

app.use(cors());

app.use(express.json({ limit: "10mb" })); // Increase limit for JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(myRouter);

app.listen(port, () => {
  console.log(`app running on port: ${port}..`);
});

// module.exports.handler = serverless(app);
