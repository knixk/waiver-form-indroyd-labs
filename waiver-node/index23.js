const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const app = express();

const port = 5050;

app.use(express.json({ limit: "10mb" })); // Increase limit for JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello world");
});

// app.listen(port, () => {
//   console.log(`app running on port: ${port}..`);
// });

module.exports.handler = serverless(app);
