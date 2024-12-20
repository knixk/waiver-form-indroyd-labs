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
    }
  );
};

// const getSubmissionsByCenter = async (con, centerId) => {
//   const query = `SELECT * FROM submissions WHERE center_id = ? ORDER BY submission_date DESC`;

//   return new Promise((resolve, reject) => {
//     con.query(query, [centerId], (err, result) => {
//       if (err) {
//         reject(err); // Reject the promise on error
//       } else {
//         resolve(result); // Resolve the promise with the result
//       }
//     });
//   });
// };

// deprecated
// const getSubmissions = async (
//   con,
//   { name = null, mobile_number = null, email = null, days = null } = {}
// ) => {
//   let getSubmissionsQuery = "SELECT * FROM submissions WHERE 1=1"; // Base query to start with

//   // Filter by name if provided
//   if (name) {
//     getSubmissionsQuery += ` AND name LIKE '%${name}%'`; // Using LIKE for partial matching
//   }

//   // Filter by mobile_number if provided
//   if (mobile_number) {
//     getSubmissionsQuery += ` AND mobile_number LIKE '%${mobile_number}%'`;
//   }

//   // Filter by email if provided
//   if (email) {
//     getSubmissionsQuery += ` AND email LIKE '%${email}%'`; // Using LIKE for partial matching
//   }

//   // Filter by submission date range if provided
//   if (days) {
//     getSubmissionsQuery += ` AND submission_date >= CURDATE() - INTERVAL ${days} DAY`;
//   }

//   // Order by the latest date
//   getSubmissionsQuery += " ORDER BY submission_date DESC";

//   return new Promise((resolve, reject) => {
//     con.query(getSubmissionsQuery, (err, result, fields) => {
//       if (err) {
//         reject(err); // Reject promise on error
//       } else {
//         resolve(result); // Resolve promise with the result
//       }
//     });
//   });
// };

const getSubmissionsByCenter = async (con, centerId, searchQuery) => {
  const query = `
    SELECT * FROM submissions 
    WHERE center_id = ? 
    AND (mobile_number LIKE ? OR email LIKE ? OR name LIKE ?)
    ORDER BY submission_date DESC`;

  const searchParam = `%${searchQuery}%`;

  return new Promise((resolve, reject) => {
    con.query(query, [centerId, searchParam, searchParam, searchParam], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
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
};
