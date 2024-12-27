const path = require("path");

module.exports = {
  entry: "./index.js", // Path to your main file
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node",
  optimization: {
    minimize: false,
  },
};
