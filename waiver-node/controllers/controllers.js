const env = require("dotenv");
env.config();

const { google } = require("googleapis");
// Google Drive API Configuration

const folder__id = process.env.GOOGLE_DRIVE_FOLDER_ID;

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

// Controller to get template_id by center_name
// const getTemplateIdByCenterName = async (req, res) => {
//   const { center_name } = req.body;

//   if (!center_name) {
//     return res.status(400).json({
//       success: false,
//       message: "center_name is required",
//     });
//   }

//   try {
//     const query = `
//       SELECT c.template_id
//       FROM centers AS c
//       WHERE c.center_name = ?
//     `;

//     const [rows] = await db.execute(query, [center_name]);

//     if (rows.length > 0) {
//       return res.status(200).json({
//         success: true,
//         response: {
//           template_id: rows[0].template_id,
//         },
//       });
//     } else {
//       return res.status(404).json({
//         success: false,
//         message: "No center found with the given name",
//       });
//     }
//   } catch (error) {
//     console.error("Error fetching template_id:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const getTemplateIdByCenterName = (con, center_name) => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT c.template_id
        FROM centers AS c
        WHERE c.center_name = ?
      `;
    con.query(query, [center_name], (err, results) => {
      if (err) {
        return reject(err); // Reject on query error
      }
      if (results.length === 0) {
        return reject(new Error("No center found with the given name")); // Reject if no results
      }
      resolve(results[0].template_id); // Resolve with the template_id
    });
  });
};

// controllers
const postASubmission = (con, data) => {
  return new Promise((resolve, reject) => {
    const query = `
        INSERT INTO submissions (template_id, submission_data, name, email, mobile_number, center_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
    con.query(
      query,
      [
        data.template_id,
        data.submission_data,
        data.name,
        data.email,
        data.mobile_number,
        data.center_id,
      ],
      (err, result) => {
        if (err) return reject(err);
        // this is the submission id, we want the template id
        resolve(result.insertId);
      }
    );
  });
};

const getTemplateByCenterName = (con, center_name) => {
  const query = `
  SELECT template_id 
  FROM centers 
  WHERE center_name = ?`;

  con.query(query, [center_name], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err });
    }
    if (result.length > 0) {
      return res.json({ template_id: result[0].template_id });
    } else {
      return res.status(404).json({ error: "Center not found" });
    }
  });
};

const postACenter = (con, data) => {
  const query = `
      INSERT INTO centers (center_name, address, contact_info, template_id, additional_info)
      VALUES (?, ?, ?, ?, ?)
    `;

  con.query(
    query,
    [
      data.center_name,
      data.address,
      JSON.stringify(data.contact_info),
      data.template_id,
      JSON.stringify(data.additional_info),
    ], // Ensure JSON is stringified
    (err, result) => {
      if (err) throw err;
    }
  );
};

const getSubmissionsByCenter = async (con, center_name, searchQuery) => {
  const query = `
  SELECT submissions.* 
  FROM submissions 
  INNER JOIN centers ON submissions.center_id = centers.id
  WHERE centers.center_name = ? 
  AND (submissions.mobile_number LIKE ? OR submissions.email LIKE ? OR submissions.name LIKE ?)
  ORDER BY submissions.submission_date DESC`;

  const searchParam = `%${searchQuery}%`;

  return new Promise((resolve, reject) => {
    con.query(
      query,
      [center_name, searchParam, searchParam, searchParam],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
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
        // console.log(result[0].template_id);
        resolve(result); // Resolve promise with the result
      }
    });
  });
};

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
        // console.log("Inserted ID:", result.insertId);
        // console.log("Insertion finished...");
        resolve(result.insertId); // Resolve with the inserted ID
      }
    );
  });
};

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

const getTemplateBySubmissionId = async (con, { submissionId = null } = {}) => {
  const query = `
      SELECT t.*
      FROM templates t
      INNER JOIN submissions s ON t.id = s.template_id
      WHERE s.id = ?
    `;

  // console.log("Fetching template for submission ID:", submissionId);
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

module.exports = {
  uploadFileToDrive,
  postASubmission,
  postACenter,
  getSubmissionsByCenter,
  getCenters,
  getTemplateByCenter,
  postATemplate,
  getTemplates,
  getSubmissionById,
  getCenterById,
  getTemplateBySubmissionId,
  getTemplateByCenterName,
  getTemplateIdByCenterName,
};
