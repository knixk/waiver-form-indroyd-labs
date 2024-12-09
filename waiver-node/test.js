const express = require("express");
const serverless = require("serverless-http");

app.use(express.json({ limit: "10mb" })); // Increase limit for JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// app.listen(port, () => {
//   console.log(`app running on port: ${port}..`);
// });

app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports.handler = serverless(app);
