const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

// const generateJWT = async (key) => {
//   const user = {
//     secretKey: key,
//   };
//   const token = jwt.sign(user, secretKey, {
//     expiresIn: "1h", // expires in one hour
//   });
//   return token;
// };

const generateJWT = (payload, secretKey) => {
  console.log("im secret key to sign ", secretKey);
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
