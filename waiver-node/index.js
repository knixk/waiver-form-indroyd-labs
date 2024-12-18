const express = require("express");
const app = express();
const port = process.env.PORT || 5050;
const cors = require("cors");
const env = require("dotenv");
const fs = require("fs");
const { connectToDatabase } = require("./connectDB.js");
const router = require("./routes/routes");
// const serverless = require("serverless-http");

// console.log(router);

env.config();

app.use(cors());

app.use(express.json({ limit: "10mb" })); // Increase limit for JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.listen(port, () => {
  console.log(`app running on port: ${port}..`);
});

// module.exports.handler = serverless(app);
