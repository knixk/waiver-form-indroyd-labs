const express = require("express");
const router = express.Router();
const {
  uploadFileToDrive,
  postASubmission,
  postACenter,
  getSubmissions,
  getCenters,
  getTemplateByCenter,
  postATemplate,
  getTemplates,
  getSubmissionById,
  getCenterById,
  getTemplateBySubmissionId,
} = require("../controllers/controllers");
const env = require("dotenv");
const jwt = require("jsonwebtoken");
env.config();
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const publicfilePath = path.resolve(__dirname, "../keys/public_key.pem");
const prvtfilePath = path.resolve(__dirname, "../keys/private_key.pem");

// Load the public key
const publicKey = fs.readFileSync(publicfilePath, "utf8");
const privateKey = fs.readFileSync(prvtfilePath, "utf8");

// Data to encrypt
const data = process.env.SECRET_KEY;
const secretKey = process.env.SECRET_KEY;
// Encrypt the data with the public key
const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(data));

// console.log("Encrypted Data:", encryptedData.toString("base64"));

// console.log("ENDS HERE \n");

const generateJWT = async (key) => {
  const user = {
    secretKey: key,
  };
  const token = jwt.sign(user, process.env.SECRET_KEY, {
    expiresIn: "1h", // expires in one hour
  });
  return token;
};

router.get("/", (req, res) => {
  res.status(200).json({
    message: "api is functional...",
  });
});

router.get("/submissions", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ message: "Database connection not established" });
  }

  console.log(req.query);
  const { mobile_number } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  console.log("token", req.query);

  if (!token) {
    return res.status(401).json({ message: "Token is required." });
  }

  try {
    const decoded = jwt.verify(token, secretKey); // Verify token

    // Optional: You can add more checks based on `decoded` content if needed
    console.log("Token Verified:", decoded);

    // Get submissions based on query params
    const filterOptions = { mobile_number }; // Adjust filterOptions as needed
    const result = await getSubmissions(con, filterOptions);

    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Invalid Token:", err);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
});

// router.post("/get-token", async (req, res) => {
//   const con = global.dbConnection;
//   if (!con) {
//     return res
//       .status(500)
//       .json({ message: "Database connection not established" });
//   }

//   const { secret_key } = req.body; // Assuming username and email are provided in the request body

//   if (!secret_key) {
//     return res.status(400).json({ message: "Secret key required" });
//   }

//   const token = await generateJWT(secret_key);

//   res.status(200).json({
//     message: "Here is your JWT Token",
//     response: {
//       token,
//     },
//   });
// });

// get all the templates

// get all the templates

router.post("/get-token", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ message: "Database connection not established" });
  }

  const { encrypted_key } = req.body; // Assuming username and email are provided in the request body

  if (!encrypted_key) {
    return res.status(400).json({ message: "Secret key required" });
  }

  try {
    // Decrypt the encrypted key using the private key
    const decryptedKey = crypto
      .privateDecrypt(privateKey, Buffer.from(encrypted_key, "base64"))
      .toString();

    // if (decryptedKey != process.env.SECRET_KEY) {
    // }
  } catch (err) {
    console.error("err");
    res.status(401).json({
      message: "You're not authorized, Invalid key",
    });
    return;
  }

  // console.log("im decrp: ", decryptedKey);

  const token = await generateJWT(process.env.SECRET_KEY);

  res.status(200).json({
    message: "Here is your JWT Token",
    response: {
      token,
    },
  });
});

router.get("/templates", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ Message: "Database connection not established" });
  }

  console.log(req.body);
  // get this from query params
  const filterOptions = {
    id: 1,
  };

  const result = await getTemplates(con, filterOptions);

  res.status(200).json({
    message: "Here is your template..",
    data: result,
  });
});

// get all the templates
router.get("/centers", async (req, res) => {
  // get this from query params

  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ Message: "Database connection not established" });
  }

  const filterOptions = {
    center_name: "game",
    days: 2,
  };

  const result = await getCenters(con, filterOptions);

  res.status(200).json({
    data: result,
    message: "Here are centers associated with given data.."
  });
});

router.post("/template-id-from-center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ Message: "Database connection not established" });
  }

  const { center_id } = req.body;

  const result = await getTemplateByCenter(con, center_id);

  if (!result || !result[0]) {
    return res.sendStatus(404).json({
      message: "Error getting template by center..",
    }); // Handle undefined or empty result
  }

  res.status(200).json({
    template_id: result[0].template_id,
    message: "Here is your template id.."
  });
});

// create submissions
router.post("/submissions", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { fixed__email, fixed__name, fixed__number } = req.body;

  const data = {
    template_id: req.body.template_id,
    submission_data: JSON.stringify(req.body),
    name: fixed__name,
    email: fixed__email,
    mobile_number: fixed__number,
  };

  postASubmission(con, data);

  res.status(200).json({
    message: "form was submitted",
  });
});

router.post("/templates", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { template_name, template_config } = req.body;

  const data = {
    template_name: template_name,
    template_config: template_config,
  };

  try {
    const ans = await postATemplate(con, data); // Await the result from the template insertion

    res.status(200).json({
      message: "Template was saved",
      response: {
        template_id: ans, // Send the inserted template ID in response
      },
    });
  } catch (err) {
    console.error("Error inserting template:", err);
    res.status(500).json({
      message: "Error saving template",
      error: err.message,
    });
  }
});

// create a center
router.post("/centers", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ message: "Database connection not established" });
  }

  const data = {
    center_name: req.body.center_name,
    address: req.body.center_address,
    contact_info: req.body.contact_info,
    template_id: req.body.template_id,
  };

  postACenter(con, data);

  res.status(200).json({
    message: "center was saved",
  });
});

// create a center
router.post("/center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const data = {
    center_name: req.body.center_name,
    address: req.body.center_address,
    contact_info: req.body.contact_info,
    template_id: req.body.template_id,
  };

  postACenter(con, data);

  res.status(200).json({
    message: "center was saved",
  });
});

// center controller
router.post("/get-center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { center_id } = req.body;
  console.log(req.body);
  // console.log(centerId)

  try {
    const center = await getCenterById(con, center_id);
    res.status(200).json({
      success: true,
      data: center,
      message: "center was found.."
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/get-submission-as-file", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const sID = 31;
  const response = getSubmissionById(con, sID);
  // res.json({
  //   data:
  // });
  res.sendStatus(200).json({
    message: "Here is your file",
  });
});

// router.post("/upload-image", async (req, res) => {

//   const { imgData } = req.body;

//   try {
//     // Save Base64 to a temporary file
//     const base64Data = imgData.replace(/^data:image\/png;base64,/, "");
//     const tempFilePath = "./temp-image.png";
//     fs.writeFileSync(tempFilePath, base64Data, "base64");

//     // Upload to Google Drive
//     const driveLink = await uploadFileToDrive(
//       "form-image.png",
//       tempFilePath,
//       "image/png"
//     );

//     // Clean up the temporary file
//     fs.unlinkSync(tempFilePath);

//     res.status(200).json({ link: driveLink });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to upload image" });
//   }
// });

// create a center

router.post("/post-center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const filterOptions = {
    id: req.body.id,
  };

  const result = await getTemplates(con, filterOptions);

  res.status(200).json({
    data: result,
    message: "Here is your template based on a center ID",
  });
});

router.post("/upload-image", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { imgData } = req.body;

  try {
    // Save Base64 PDF data to a temporary file
    const base64Data = imgData.replace(/^data:application\/pdf;base64,/, "");
    const tempFilePath = "./temp-file.pdf";
    fs.writeFileSync(tempFilePath, base64Data, "base64");

    // Upload to Google Drive
    const driveLink = await uploadFileToDrive(
      "form-image.pdf", // Change to .pdf
      tempFilePath,
      "application/pdf"
    );

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    res.status(200).json({ link: driveLink });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload PDF" });
  }
});

router.get("/submission/ack/:id", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { id } = req.params;

  con.query(
    "SELECT submission_data FROM submissions WHERE id = ?",
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ error: "Not found" });

      const submissionData = JSON.parse(results[0].submission_data);
      return res.status(200).json({ imgLink: submissionData.imgLink });
    }
  );
});

// Endpoint to fetch template by submission ID
router.post("/template-from-sid", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { submissionId } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: "Submission ID is required" });
  }

  try {
    const template = await getTemplateBySubmissionId(con, { submissionId });
    if (template.length === 0) {
      return res
        .status(404)
        .json({ error: "Template not found for the given submission ID" });
    }
    res.json({ template, message: "Here is the template used by the given submission ID" });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
