const mysql = require("mysql");
const env = require("dotenv");
env.config();

const connectToDatabase = () => {
  return new Promise(async (resolve, reject) => {
    const connectionObj = await mysql.createConnection({
      host: process.env.MY_HOST,
      user: process.env.MY_USER,
      password: process.env.MY_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.AWS_DATABASE_PORT,
    });

    // Attempt to connect
    await connectionObj.connect((err) => {
      if (err) {
        return reject(
          new Error("Failed to connect to database: " + err.message)
        );
      }
      resolve(connectionObj);
    });

    // Timeout if connection takes too long
    setTimeout(() => {
      reject(new Error("Database connection timeout"));
    }, 25 * 1000); // Timeout after 10 seconds
  });
};

module.exports = {
  connectToDatabase,
};
