const express = require("express");
const mysql = require("mysql");
const app = express();
const port = process.env.PORT || 5050;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
const { google } = require("googleapis");
const fs = require("fs");
// const serverless = require("serverless-http");

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

// Usage
(async () => {
  try {
    const dbConnection = await connectToDatabase();
    console.log("Database connected successfully");
    // You can now use dbConnection in your app
  } catch (err) {
    console.error(err.message);
  }
})();

app.use(async (req, res, next) => {
  try {
    if (!global.dbConnection) {
      global.dbConnection = await connectToDatabase(); // Wait for connection
    }
    req.db = global.dbConnection; // Pass connection to routes
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const folder__id = process.env.GOOGLE_DRIVE_FOLDER_ID;

app.use(express.json({ limit: "10mb" })); // Increase limit for JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Google Drive API Configuration
const auth = new google.auth.GoogleAuth({
  keyFile: "./creds2.json", // Path to your credentials.json
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

const uploadFileToDrive = async (fileName, filePath, mimeType) => {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folder__id], // Replace with the folder ID in Google Drive
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Generate and return the shareable link
    const shareableLink = `https://drive.google.com/uc?id=${response.data.id}&export=download`;
    return shareableLink;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw new Error("Failed to upload to Google Drive");
  }
};

const secretKey = process.env.SECRET_KEY;

// controllers
const postASubmission = (con, data) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO submissions (template_id, submission_data, name, email, mobile_number)
      VALUES (?, ?, ?, ?, ?)
    `;
    con.query(
      query,
      [
        data.template_id,
        data.submission_data,
        data.name,
        data.email,
        data.mobile_number,
      ],
      (err, result) => {
        if (err) return reject(err);
        // this is the submission id, we want the template id
        resolve(result.insertId);
      }
    );
  });
};

const postACenter = (con, data) => {
  const query = `
    INSERT INTO centers (center_name, address, contact_info, template_id)
    VALUES (?, ?, ?, ?)
  `;

  con.query(
    query,
    [
      data.center_name,
      data.address,
      JSON.stringify(data.contact_info),
      data.template_id,
    ], // Ensure JSON is stringified
    (err, result) => {
      if (err) throw err;
      console.log("Inserted ID:", result.insertId);
      console.log("Insertion finished.");
    }
  );
};

const getSubmissions = async (
  con,
  { name = null, mobile_number = null, email = null, days = null } = {}
) => {
  let getSubmissionsQuery = "SELECT * FROM submissions WHERE 1=1"; // Base query to start with

  // Filter by name if provided
  if (name) {
    getSubmissionsQuery += ` AND name LIKE '%${name}%'`; // Using LIKE for partial matching
  }

  // Filter by mobile_number if provided
  if (mobile_number) {
    getSubmissionsQuery += ` AND mobile_number LIKE '%${mobile_number}%'`;
  }

  // Filter by email if provided
  if (email) {
    getSubmissionsQuery += ` AND email LIKE '%${email}%'`; // Using LIKE for partial matching
  }

  // Filter by submission date range if provided
  if (days) {
    getSubmissionsQuery += ` AND submission_date >= CURDATE() - INTERVAL ${days} DAY`;
  }

  // Order by the latest date
  getSubmissionsQuery += " ORDER BY submission_date DESC";

  return new Promise((resolve, reject) => {
    con.query(getSubmissionsQuery, (err, result, fields) => {
      if (err) {
        reject(err); // Reject promise on error
      } else {
        resolve(result); // Resolve promise with the result
      }
    });
  });
};

const getCenters = async (con, { center_name = null, days = null } = {}) => {
  let getCentersQuery = "SELECT * FROM centers WHERE 1=1"; // Base query to start with

  // Filter by name if provided
  if (center_name) {
    getCentersQuery += ` AND center_name LIKE '%${center_name}%'`; // Using LIKE for partial matching
  }

  return new Promise((resolve, reject) => {
    con.query(getCentersQuery, (err, result, fields) => {
      if (err) {
        reject(err); // Reject promise on error
      } else {
        console.log(result[0].template_id);
        resolve(result); // Resolve promise with the result
      }
    });
  });
};

const generateJWT = async (key) => {
  const user = {
    secretKey: key,
  };
  const token = jwt.sign(user, secretKey, {
    expiresIn: "1h", // expires in one hour
  });
  return token;
};

app.use(cors());

app.listen(port, () => {
  console.log(`app running on port: ${port}..`);
});

app.get("/", (req, res) => {
  res.status(200).json({
    msg: "api is functional...",
  });
});

app.get("/submissions", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
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

app.post("/get-token", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { secret_key } = req.body; // Assuming username and email are provided in the request body

  if (!secret_key) {
    return res.status(400).json({ message: "Secret key required" });
  }

  const token = await generateJWT(secret_key);

  res.status(200).json({
    token,
  });
});

// get all the templates
app.get("/templates", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  console.log(req.body);
  // get this from query params
  const filterOptions = {
    id: 1,
  };

  const result = await getTemplates(con, filterOptions);

  res.status(200).json({
    data: result,
  });
});

// get all the templates
app.get("/centers", async (req, res) => {
  // get this from query params

  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const filterOptions = {
    center_name: "game",
    days: 2,
  };

  const result = await getCenters(con, filterOptions);

  res.status(200).json({
    data: result,
  });
});

const getTemplateByCenter = async (con, centerId) => {
  const query = `
    SELECT * 
    FROM templates INNER JOIN centers ON centers.template_id = templates.id
    WHERE centers.id = ?`;

  return new Promise((resolve, reject) => {
    con.query(query, [centerId], (err, result) => {
      if (err) {
        reject(err); // Reject promise on error
      } else {
        resolve(result); // Resolve with the fetched template data
      }
    });
  });
};

app.post("/template-id-from-center", async (req, res) => {
  const con = global.dbConnection;
  if (!con) {
    return res
      .status(500)
      .json({ error: "Database connection not established" });
  }

  const { center_id } = req.body;

  const result = await getTemplateByCenter(con, center_id);

  if (!result || !result[0]) {
    return res.sendStatus(404).json({
      msg: "Error getting template by center..",
    }); // Handle undefined or empty result
  }

  res.status(200).json({
    template_id: result[0].template_id,
  });
});

// create submissions
app.post("/submissions", async (req, res) => {
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
    msg: "form was submitted",
  });
});

const postATemplate = (con, data) => {
  const query = `
    INSERT INTO templates (template_name, template_config)
    VALUES (?, ?)
  `;

  return new Promise((resolve, reject) => {
    con.query(
      query,
      [data.template_name, JSON.stringify(data.template_config)],
      (err, result) => {
        if (err) {
          return reject(err); // Reject if there's an error
        }
        console.log("Inserted ID:", result.insertId);
        console.log("Insertion finished...");
        resolve(result.insertId); // Resolve with the inserted ID
      }
    );
  });
};

app.post("/templates", async (req, res) => {
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
      msg: "Template was saved",
      template_id: ans, // Send the inserted template ID in response
    });
  } catch (err) {
    console.error("Error inserting template:", err);
    res.status(500).json({
      msg: "Error saving template",
      error: err.message,
    });
  }
});

// create a center
app.post("/centers", async (req, res) => {
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
    msg: "center was saved",
  });
});

const getTemplates = async (con, { id = null } = {}) => {
  let getTemplatesQuery = `SELECT * FROM templates WHERE id = ?`; // Base query to start with

  return new Promise((resolve, reject) => {
    con.query(getTemplatesQuery, [id], (err, result, fields) => {
      if (err) {
        reject(err); // Reject promise on error
      } else {
        resolve(result); // Resolve promise with the result
      }
    });
  });
};

// create a center
app.post("/center", async (req, res) => {
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
    msg: "center was saved",
  });
});

const getSubmissionById = (dbConnection, submissionId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM submissions WHERE id = ?";

    dbConnection.query(query, [submissionId], (err, result) => {
      if (err) {
        reject(err); // Reject promise on query error
      } else if (result.length === 0) {
        reject(new Error(`Submission with ID ${submissionId} not found.`)); // Handle no result
      } else {
        resolve(result[0]); // Resolve promise with the first result
      }
    });
  });
};

// center controller
// this works
const getCenterById = (dbConnection, centerId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM centers WHERE id = ?";
    dbConnection.query(query, [centerId], (err, result) => {
      if (err) {
        reject(err); // Reject on query error
      } else if (result.length === 0) {
        reject(new Error(`Center with ID ${centerId} not found.`)); // Handle no result
      } else {
        resolve(result[0]); // Resolve with the first result
      }
    });
  });
};

app.post("/get-center", async (req, res) => {
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
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// post a center id
// app.post("/center-by-id", async (req, res) => {
//   console.log(req.body);
//   const con = global.dbConnection;
//   if (!con) {
//     return res
//       .status(500)
//       .json({ error: "Database connection not established" });
//   }

//   const { center_id } = req.body;

//   const result = await getCenterByID(con, center_id);
//   console.log(result)

//   // if (!result || !result[0]) {
//   //   return res.sendStatus(404).json({
//   //     msg: "Error getting info by center..",
//   //   }); // Handle undefined or empty result
//   // }

//   res.status(200).json({
//     center_id: result[0],
//   });
// });

app.post("/get-submission-as-file", async (req, res) => {
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
    msg: "",
  });
});

// app.post("/upload-image", async (req, res) => {

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

app.post("/post-center", async (req, res) => {
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
  });
});

app.post("/upload-image", async (req, res) => {
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

app.get("/submission/ack/:id", async (req, res) => {
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

const getTemplateBySubmissionId = async (con, { submissionId = null } = {}) => {
  const query = `
    SELECT t.*
    FROM templates t
    INNER JOIN submissions s ON t.id = s.template_id
    WHERE s.id = ?
  `;

  console.log("Fetching template for submission ID:", submissionId);
  return new Promise((resolve, reject) => {
    con.query(query, [submissionId], (err, result) => {
      if (err) {
        reject(err); // Reject the promise on error
      } else {
        resolve(result); // Resolve the promise with the result
      }
    });
  });
};

// Endpoint to fetch template by submission ID
app.post("/template-from-sid", async (req, res) => {
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
    res.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// module.exports.handler = serverless(app);
