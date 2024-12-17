const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

const generateJWT = async (key) => {
  const user = {
    secretKey: key,
  };
  const token = jwt.sign(user, secretKey, {
    expiresIn: "1h", // expires in one hour
  });
  return token;
};

module.exports = {
  generateJWT,
};
