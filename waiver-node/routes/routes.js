const express = require("express");
const router = express.Router();
const {
  uploadFileToDrive,
  postASubmission,
  postACenter,
  // getSubmissions,
  getSubmissionsByCenter,
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

const { generateJWT } = require("../authentication/jwt");

// Load the public key
const publicKey = fs.readFileSync(publicfilePath, "utf8");
const privateKey = fs.readFileSync(prvtfilePath, "utf8");

// Encrypt the data with the public key

const myPayload = {
  center_id: 6,
  expiresIn: Date.now() + 3600000, // 1-hour expiration
};

const encryptedData = crypto.publicEncrypt(
  publicKey,
  Buffer.from(JSON.stringify(myPayload))
);
// uncomment this to get the encrypted_key
// console.log("Encrypted Data:", encryptedData.toString("base64"));

router.get("/", (req, res) => {
  res.status(200).json({
    message: "api is functional...",
    code: 200,
    response: {},
  });
});

// router.get("/submissions", async (req, res) => {
//   const con = global.dbConnection;
//   if (!con) {
//     return res.status(500).json({
//       message: "Database connection not established",
//       code: 500,
//       response: {},
//     });
//   }

//   const token = req.headers.authorization?.split(" ")[1];

//   // console.log("im the token being verified, ", token);

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Token is required.", code: 401, response: {} });
//   }

//   try {
//     // Verify and decode the token
//     const decoded = jwt.verify(token, process.env.SECRET_KEY); // Replace `secretKey` with your JWT secret

//     // console.log(decoded);
//     const { center_id } = decoded;

//     // console.log(center_id)

//     if (!center_id) {
//       return res.status(403).json({
//         message: "Invalid token payload. Missing center_id.",
//         code: 403,
//         response: {},
//       });
//     }

//     // Query submissions for the center_id
//     const result = await getSubmissionsByCenter(con, center_id);

//     res.status(200).json({
//       response: result,
//       message: "Submissions for the center.",
//       code: 200,
//     });
//   } catch (err) {
//     console.error("Invalid Token:", err);
//     return res
//       .status(403)
//       .json({ message: "Invalid or expired token.", code: 403, response: {} });
//   }
// });

router.get("/submissions", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Token is required.",
      code: 401,
      response: {},
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { center_id } = decoded;
    if (!center_id) {
      return res.status(403).json({
        message: "Invalid token payload. Missing center_id.",
        code: 403,
        response: {},
      });
    }

    // Extract search query
    const searchQuery = req.query.search || "";

    // Query submissions for the center_id with optional search
    const result = await getSubmissionsByCenter(con, center_id, searchQuery);

    res.status(200).json({
      response: result,
      message: "Submissions for the center.",
      code: 200,
    });
  } catch (err) {
    console.error("Invalid Token:", err);
    return res.status(403).json({
      message: "Invalid or expired token.",
      code: 403,
      response: {},
    });
  }
});


router.post("/get-token", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  const { encrypted_key } = req.body; // Assuming username and email are provided in the request body

  if (!encrypted_key) {
    return res
      .status(400)
      .json({ message: "Secret key required", code: 400, response: {} });
  }

  try {
    // Decrypt the encrypted key using the private key

    const decryptedData = crypto
      .privateDecrypt(privateKey, Buffer.from(encrypted_key, "base64"))
      .toString();

    // Parse the JSON string into an object
    const payload = JSON.parse(decryptedData);
    console.log("im payload, ", payload);
    // Access payload properties
    const token = await generateJWT(payload, process.env.SECRET_KEY);

    res.status(200).json({
      message: "Here is your JWT Token",
      response: {
        token,
      },
      code: 200,
    });
  } catch (err) {
    console.error("err");
    res.status(401).json({
      message: "You're not authorized, Invalid key",
      code: 401,
      response: {},
    });
    return;
  }
});

router.get("/templates", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  // get this from query params
  const filterOptions = {
    id: 1,
  };

  const result = await getTemplates(con, filterOptions);

  res.status(200).json({
    message: "Here is your template..",
    code: 200,
    response: {
      result,
    },
  });
});

// get all the templates
router.get("/centers", async (req, res) => {
  // get this from query params

  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  const filterOptions = {
    center_name: "game",
    days: 2,
  };

  const result = await getCenters(con, filterOptions);

  res.status(200).json({
    message: "Here are centers associated with given data..",
    code: 200,
    response: {
      result,
    },
  });
});

router.post("/template-id-from-center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",

      code: 500,
      response: {},
    });
  }

  const { center_id } = req.body;

  const result = await getTemplateByCenter(con, center_id);

  if (!result || !result[0]) {
    return res.sendStatus(404).json({
      message: "Error getting template by center..",
      code: 404,
      response: {},
    }); // Handle undefined or empty result
  }

  res.status(200).json({
    message: "Here is your template id..",
    code: 200,
    response: {
      template_id: result[0].template_id,
    },
  });
});

// create submissions
router.post("/submissions", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",

      code: 500,
      response: {},
    });
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
    code: 200,
    response: {},
  });
});

router.post("/templates", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",

      code: 500,
      response: {},
    });
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
      code: 200,
      response: {
        template_id: ans, // Send the inserted template ID in response
      },
    });
  } catch (err) {
    console.error("Error inserting template:", err);
    res.status(500).json({
      message: "Error saving template",
      code: 500,
      response: {},
    });
  }
});

// create a center
router.post("/centers", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",

      code: 500,
      response: {},
    });
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
    code: 200,
    response: {},
  });
});

// create a center
router.post("/center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
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
    code: 200,
    response: {},
  });
});

// center controller
router.post("/get-center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  const { center_id } = req.body;

  try {
    const center = await getCenterById(con, center_id);
    res.status(200).json({
      code: 200,
      response: {
        success: true,
        data: center,
      },
      message: "center was found..",
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: err.message, code: 500, response: {} });
  }
});

router.post("/get-submission-as-file", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  const sID = 31;
  const response = getSubmissionById(con, sID);

  res.sendStatus(200).json({
    message: "Here is your file",
    code: 200,
    response: {
      response,
    },
  });
});

// deprecated route but works
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
    return res.status(500).json({
      message: "Database connection not established",
    });
  }

  const filterOptions = {
    id: req.body.id,
  };

  const result = await getTemplates(con, filterOptions);

  res.status(200).json({
    response: result,
    message: "Here is your template based on a center ID",
    code: 200,
  });
});

router.post("/upload-image", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
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

    res.status(200).json({
      code: 200,
      response: { link: driveLink },
      message: "Here is your link",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to upload PDF", code: 500, response: {} });
  }
});

router.get("/submission/ack/:id", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
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
      return res
        .status(200)
        .json({ code: 500, response: { imgLink: submissionData.imgLink } });
    }
  );
});

// Endpoint to fetch template by submission ID
router.post("/template-from-sid", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res.status(500).json({
      message: "Database connection not established",
      code: 500,
      response: {},
    });
  }

  const { submissionId } = req.body;

  if (!submissionId) {
    return res
      .status(400)
      .json({ error: "Submission ID is required", code: 400, response: {} });
  }

  try {
    const template = await getTemplateBySubmissionId(con, { submissionId });
    if (template.length === 0) {
      return res.status(404).json({
        message: "Template not found for the given submission ID",
        code: 404,
        response: {},
      });
    }
    res.json({
      message: "Here is the template used by the given submission ID",
      code: 400,
      response: { template },
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res
      .status(500)
      .json({ code: 500, response: {}, message: "Internal Server Error" });
  }
});

module.exports = router;
