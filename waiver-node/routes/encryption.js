const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// npm i crypto
// npm i path

// pkg was a .exe convertor, if it gives an error, install it too
// npm i pkg

// provide path according to your folder structure..
const publicfilePath = process.pkg
  ? path.join(process.cwd(), "keys/public_key.pem") // For bundled app
  : path.resolve(__dirname, "../keys/public_key.pem"); // For development

const prvtfilePath = process.pkg
  ? path.join(process.cwd(), "keys/private_key.pem") // For bundled app
  : path.resolve(__dirname, "../keys/private_key.pem");

// Load the key from the file paths
const publicKey = fs.readFileSync(publicfilePath, "utf8");
const privateKey = fs.readFileSync(prvtfilePath, "utf8");

// the center you want
const myPayload = {
  center_id: 6,
  expiresIn: Date.now() + 3600000, // 1-hour expiration
};

//  this is your encrypted_key you pass in the postman payload
const encryptedData = crypto.publicEncrypt(
  publicKey,
  Buffer.from(JSON.stringify(myPayload))
);


// To decrypt the encryptedData:
const decryptedData = crypto
  .privateDecrypt(privateKey, Buffer.from(encryptedData, "base64"))
  .toString();

// Parse the JSON string into an object and get the data
const payload = JSON.parse(decryptedData);
// console.log(payload)
