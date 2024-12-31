const jwt = require("jsonwebtoken");

const generateJWT = (payload, secretKey) => {
  // console.log("im secret key to sign ", secretKey);
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, { expiresIn: "24h" }, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

module.exports = {
  generateJWT,
};
