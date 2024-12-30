import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { nanoid } from "nanoid";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// uncomment to import the dummyTemplate
// import template_config from "../misc/dummyData/dummyTemplates/main-template-config.json";
import dummyCenter from "../misc/dummyData/dummyCenters/dummyCenter.json";
import placeholderImg from "../assets/placeholder.jpg";

import * as Yup from "yup";

// This is the schema to be used with validation fields
// const validationSchema = Yup.object().shape({
//   phoneNumber: Yup.string()
//     .matches(/^\+?\d{10,15}$/, "Invalid phone number")
//     .required("Phone number is required"),
//   zipCode: Yup.string()
//     .matches(/^\d{6}(-\d{4})?$/, "Invalid ZIP code")
//     .required("ZIP code is required"),
//   email: Yup.string()
//     .email("Invalid email address")
//     .required("Email is required"),
//   // Add more validations as needed
// });

import { useContext } from "react";
import { MyContext } from "../App";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextareaAutosize,
  Checkbox,
} from "@mui/material";

const uri =
  import.meta.env.VITE_MODE == "prod"
    ? import.meta.env.VITE_AWS_URI
    : import.meta.env.VITE_API_LOCAL_URI;

import deleteIcon from "../assets/delete.png";

const CheckboxQuestion = ({ question, formData, handleInputChange }) => {
  return (
    question.input_type === "checkbox" &&
    question.label && (
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <Checkbox
          checked={formData[question.question_id] || false} // Ensures it shows the correct state
          onChange={(e) =>
            handleInputChange(question.question_id, e.target.checked)
          } // Updates state on change
          sx={question.customStyles} // Optional custom styles
        />
        <Typography
          sx={{
            ...question.customStyles, // Any additional custom styles
          }}
        >
          {question.label}
        </Typography>
      </FormControl>
    )
  );
};

// add signature cecks
// create a template builder

const Form = () => {
  const myState = useContext(MyContext);
  const {
    loading,
    setLoading,
    companyName,
    setCompanyName,
    displayForm,
    setDisplayForm,
    disabled,
    setDisabled,
    extraFields,
    setExtraFields,
    questions,
    setQuestions,
    templateId,
    setTemplateId,
    sign,
    setSign,
    participants,
    setParticipants,
    formData,
    setFormData,
    companyLogo,
    setCompanyLogo,
    awsURI,
    wantParticipants,
    setWantParticipants,
    centerID,
    setCenterID,
    centerInfo,
    setCenterInfo,
    centerAddInfo,
    setCenterAddInfo,
  } = myState;

  const [errors, setErrors] = useState({});

  const validateField = (fieldKey, value) => {
    let schema = yup.string().email("Invalid email").required();
    schema
      .validate(value)
      .then(() => setErrors((prev) => ({ ...prev, [fieldKey]: null })))
      .catch((err) =>
        setErrors((prev) => ({ ...prev, [fieldKey]: err.message }))
      );
  };

  const navigate = useNavigate();
  const queryParameters = new URLSearchParams(window.location.search);
  const centerParams = queryParameters.get("center");

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (formData["want_participant_id"] == "Me and my kids!") {
      // setWantParticipants(true);
    } else {
      // setWantParticipants(false);
    }
  };

  const handleRadioChange = (questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    if (value == "Me and my kids!") {
      setWantParticipants(true);
    } else {
      setWantParticipants(false);
      setParticipants([]);
    }
  };

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        id: nanoid(),
      },
    ]);
  };

  const updateParticipant = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  const deleteParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadImageToBackend = async (imgData) => {
    const response = await axios.post(`${uri}/upload-image`, {
      imgData,
    });
    return response.data.link; // Backend returns the Google Drive link
  };

  const getTemplateId = async (centerName) => {
    try {
      const response = await axios.get(`${uri}/get-template-id`, {
        params: { center_name: centerName },
      });

      console.log(response, "temp");
      console.log("Template ID:", response.data.template_id);
      return response.data.template_id;
    } catch (error) {
      if (error.response) {
        console.error("Error:", error.response.data.error);
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    // console.log(sign?.getTrimmedCanvas().width == 1)
    // setFormData({});
    e.preventDefault();

    let err = false;

    if (err) {
      return;
    }

    if (sign?.getTrimmedCanvas().width == 1) {
      toast.error("You must sign the form!");
      return;
    }

    toast("Submitting form, please wait...");
    setDisabled(true);

    const formElement = document.querySelector("body");
    const canvas = await html2canvas(formElement, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      scale: 1,
      logging: true,
      ignoreElements: (element) => element.tagName === "SCRIPT",
    });

    // Get the dimensions of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pdf = new jsPDF({
      unit: "px", // Use pixels as the unit
      format: [canvasWidth, canvasHeight], // Set PDF page size to canvas dimensions
    });

    pdf.addImage(canvas, "PNG", 0, 0, canvasWidth, canvasHeight); // Adding the canvas to the PDF
    const pdfBlob = pdf.output("blob");

    // Convert Blob to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result.split(",")[1]; // Extract Base64 string
      const payload = { imgData: `data:application/pdf;base64,${base64Data}` };

      // We were uploading the signature on google drive, but changed plans
      // we're putting it directly in the db, sizes around 24kb
      try {
        // const response = await axios.post(
        //   "http://localhost:5050/upload-image",
        //   payload
        // );
        // const driveLink = response.data.link || ""; // Get the Google Drive link
        const submissionPayload = {
          ...formData,
          participants,
          template_id: templateId,
          // imgLink: driveLink,
          signature_data: sign?.getTrimmedCanvas().toDataURL("image/png"),
          center_id: centerID,
        };

        await axios.post(`${uri}/submissions`, submissionPayload);
        toast.success("Form submitted successfully!");
        setTimeout(() => navigate(`/?center=${centerID}`), 3000);
      } catch (error) {
        toast.error("Submission failed!");
        console.error(error);
      }
    };
    reader.readAsDataURL(pdfBlob);
  };

  useEffect(() => {
    // setting the template info here..
    if (
      import.meta.env.VITE_MODE == "prod" ||
      import.meta.env.VITE_MODE == "dev"
    ) {
      console.log("in prod mode..");

      // fold flow, center ID -> template ID
      // new flow, center Name -> center ID -> ....

      // previously this one was being used, we can use this again
      const getTemplateIdFromCenterID = async (id) => {
        let ans = null;
        const templates = `${uri}/template-id-from-center`;

        const options = {
          center_id: id,
        };

        try {
          const response = await axios.post(templates, options);
          ans = response.data.response.template_id;
          setTemplateId(ans);
        } catch (error) {
          console.error(error);
          toast("No form found...");
          setTimeout(() => navigate("/"), 5000);
        }

        return ans;
      };

      // new one:
      const getCenterIdFromCenterName = async (centerName) => {
        let centerId = null;
        const endpoint = `${uri}/center-id-from-center-name`;

        const options = {
          center_name: centerName,
        };

        try {
          const response = await axios.post(endpoint, options);
          centerId = response.data.response.center_id;
        } catch (error) {
          console.error(error);
          toast("Center not found...");
          setTimeout(() => navigate("/"), 5000);
        }

        return centerId;
      };

      // new one use this to send the req to get the t_id from c_id
      const getTemplateIdFromCenterName = async (centerName) => {
        let ans = null;
        const templates = `${uri}/template-id-from-center-name`;

        const options = {
          center_name: centerName,
        };

        try {
          const response = await axios.post(templates, options);
          ans = response.data.response.template_id;

          // set the template id
          setTemplateId(ans);
        } catch (error) {
          console.error(error);
          toast("No form found...");
          setTimeout(() => navigate("/"), 5000);
        }

        // return back the template id
        return ans;
      };

      const fetchTemplate = async (t_id) => {
        const templates = `${uri}/post-center`;

        const options = {
          id: t_id,
        };

        try {
          const response = await axios.post(templates, options);
          const myData = JSON.parse(response.data.response[0].template_config);

          if (myData) {
            setQuestions(myData.questions);
            // set the company logo from the center, it's ok make the req
            setCompanyLogo(myData.company_logo);
            setExtraFields(myData.extra_participants_form_fields);
            setDisplayForm(true);
            setCompanyName(myData.company_name);
            setLoading(false);
          }
        } catch (error) {
          toast("template doesn't exist");
          console.error(
            "Error:",
            error.response ? error.response.data : error.message
          );
        }
      };

      const asyncFnStitch = async () => {
        if (!centerID) {
          // don't set the id to the name, set it to an id, get it from name
          // setCenterID(29);
        }

        // const data =
        //   centerParams && (await getTemplateIdFromCenterID(centerParams));
        // data && (await fetchTemplate(data));
        console.log("here");
        const my_center_id = await getCenterIdFromCenterName(centerParams);

        setCenterID(my_center_id);

        const data =
          my_center_id && (await getTemplateIdFromCenterID(my_center_id));

        data && (await fetchTemplate(data));

        // this is to get the template:
        // center params contains any str, you type after ?center= , so it will contain the name too.
        // const data =
        //   centerParams && (await getTemplateIdFromCenterName(centerParams));
        // data && (await fetchTemplate(data));

        // we still don't know the center name right? hmm yeah
        // we need to get the id too so we can fetch details

        /* to dos:
        don't you think if ur getting center i
        */
      };

      asyncFnStitch();
    }

    // Setting the center info here
    if (
      import.meta.env.VITE_MODE == "prod" ||
      import.meta.env.VITE_MODE == "dev"
    ) {
      const postCenter = async (centerId) => {
        console.log(centerId, "im ci");
        const center = `${uri}/get-center`;
        const options = {
          center_id: centerId,
        };

        try {
          const response = await axios.post(center, options);
          setCenterInfo(response.data.response.data);
          const addInfo = JSON.parse(
            response.data.response.data.additional_info
          );
          setCenterAddInfo(addInfo);
          return response.data.data; // Return the response data
        } catch (error) {
          console.error(
            "Error posting center:",
            error.response?.data || error.message // Handle error gracefully
          );
          throw error; // Rethrow the error for further handling
        }
      };
      if (!centerParams) {
        setCenterID(6);
        postCenter(6);
      } else {
        // centerParams && setCenterID(centerParams);
        centerID && postCenter(centerID);
      }
    }

    if (import.meta.env.VITE_MODE == "dev") {
      console.log("inside dev mode...");
      setCenterInfo(dummyCenter);
      setCenterAddInfo(dummyCenter);
    }
  }, []);

  return (
    <div className="form__container__main">
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
        <Toaster />
        {displayForm ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              color="black"
              marginTop={2}
              letterSpacing={1.5}
            >
              {centerInfo && centerInfo.center_name}
            </Typography>

            {/* {centerInfo && (
              <img
                className="form__logo"
                src={JSON.parse(centerInfo.additional_info).img}
                alt="logo"
              />
            )} */}

            {centerInfo && (
              <img
                className="form__logo"
                src={
                  JSON.parse(centerInfo.additional_info).img == ""
                    ? placeholderImg
                    : JSON.parse(centerInfo.additional_info).img
                }
                alt="logo"
              />
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                required
                onChange={(e) =>
                  handleInputChange("fixed__name", e.target.value)
                }
              />
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                required
                type="email"
                error={!!errors.email}
                onChange={(e) => {
                  handleInputChange("fixed__email", e.target.value);
                  // validateField("email", e.target.value);
                }}
                helperText={errors.email}
              />
              <TextField
                fullWidth
                label="Mobile Number"
                margin="normal"
                required
                type="tel"
                error={!!errors.phoneNumber}
                onChange={(e) => {
                  handleInputChange("fixed__number", e.target.value);
                  // validateField("phoneNumber", e.target.value);
                }}
                helperText={errors.phoneNumber}
              />
              {questions &&
                questions.map((question) => (
                  <Box key={question.question_id} sx={{ mt: 2 }}>
                    {question.input_type === "label" && question.label && (
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            ...question.customStyles, // Any additional custom styles
                          }}
                        >
                          {question.label}
                        </Typography>
                      </FormControl>
                    )}

                    {question.image && (
                      <img className="question__image" src={question.image} />
                    )}

                    {question.input_type === "text" && question.label && (
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            ...question.customStyles, // Any additional custom styles
                          }}
                        >
                          {question.label}
                        </Typography>
                        <TextField
                          type={question.variant || "text"}
                          variant="outlined"
                          fullWidth
                          error={
                            (question.variant == "phone_number" &&
                              !!errors.phoneNumber) ||
                            (question.variant == "zip_code" &&
                              !!errors.zipCode) ||
                            (question.variant == "email" && !!errors.email)
                          }
                          helperText={
                            (question.variant == "phone_number" &&
                              errors.phoneNumber) ||
                            (question.variant == "zip_code" &&
                              errors.zipCode) ||
                            (question.variant == "email" && errors.email)
                          }
                          value={formData[question.question_id] || ""}
                          required={question.required || false}
                          onChange={(e) => {
                            handleInputChange(
                              question.question_id,
                              e.target.value
                            );

                            if (question.variant == "phone_number") {
                              // validateField("phoneNumber", e.target.value);
                              // console.log("phone val");
                            }

                            if (question.variant == "zip_code") {
                              // validateField("zipCode", e.target.value);
                              // console.log("zip code val");
                            }

                            if (question.variant == "email") {
                              // validateField("email", e.target.value);
                              // console.log("email val");
                            }
                          }}
                          placeholder={
                            question.input_placeholder || "Enter your response"
                          }
                          sx={{ mt: 2, ...question.customStyles }}
                        />
                      </FormControl>
                    )}

                    {question.input_type === "dropdown" && (
                      <FormControl fullWidth margin="normal">
                        <Typography
                          sx={{
                            ...question.customStyles, // Any additional custom styles
                          }}
                        >
                          {question.label}
                        </Typography>

                        <Select
                          value={formData[question.question_id] || ""}
                          required={question.required || false}
                          onChange={(e) =>
                            handleInputChange(
                              question.question_id,
                              e.target.value
                            )
                          }
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Choose
                          </MenuItem>
                          {question.values.split(",").map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    {question.input_type === "radio" && (
                      <FormControl component="fieldset">
                        <Typography
                          sx={{
                            ...question.customStyles, // Any additional custom styles
                          }}
                        >
                          {question.label}
                        </Typography>

                        <RadioGroup
                          required={question.required || false}
                          onChange={(e) =>
                            handleRadioChange(
                              question.question_id,
                              e.target.value
                            )
                          }
                        >
                          {question.values.split(",").map((option) => (
                            <FormControlLabel
                              key={option}
                              value={option}
                              control={<Radio />}
                              label={option}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    )}

                    {question.input_type === "textarea" && question.label && (
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            ...question.customStyles,
                          }}
                        >
                          {question.label}
                        </Typography>
                        <TextField
                          multiline
                          rows={question.rows || 4}
                          variant="outlined"
                          fullWidth
                          required={question.required || false}
                          value={formData[question.question_id] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              question.question_id,
                              e.target.value
                            )
                          }
                          placeholder={
                            question.placeholder || "Enter your response"
                          }
                          sx={{ mt: 2, ...question.customTextAreaStyles }}
                        />
                      </FormControl>
                    )}

                    {/* For Date */}
                    {question.input_type === "date" && question.label && (
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            ...question.customStyles,
                          }}
                        >
                          {question.label}
                        </Typography>
                        <TextField
                          required={question.required || false}
                          type="date"
                          variant="outlined"
                          fullWidth
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={formData[question.question_id] || ""}
                          onChange={(e) =>
                            handleInputChange(
                              question.question_id,
                              e.target.value
                            )
                          }
                          sx={{
                            mt: 2,
                            ...question.customDateStyles,
                          }}
                        />
                      </FormControl>
                    )}

                    {question.input_type === "checkbox" && question.label && (
                      <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <Typography
                          sx={{
                            ...question.customStyles, // Any additional custom styles
                          }}
                        >
                          {question.label}
                        </Typography>
                        <Checkbox
                          required={question.required || false}
                          checked={formData[question.question_id] || false} // Ensures it shows the correct state
                          onChange={(e) =>
                            handleInputChange(
                              question.question_id,
                              e.target.checked
                            )
                          } // Updates state on change
                          sx={question.customStyles} // Optional custom styles
                        />
                      </FormControl>
                    )}

                    {question.input_type === "file" && (
                      <FormControl fullWidth margin="normal">
                        <Typography
                          sx={{
                            ...question.customStyles, // Any additional custom styles
                          }}
                        >
                          {question.label}
                        </Typography>
                        <Button
                          variant="contained"
                          component="label"
                          color="primary"
                        >
                          Upload File
                          <input
                            required={question.required || false}
                            type="file"
                            hidden
                            onChange={(e) =>
                              handleInputChange(
                                question.question_id,
                                e.target.files[0].name
                              )
                            }
                          />
                        </Button>
                        {formData[question.question_id] && (
                          <Typography variant="body2" marginTop={1}>
                            Selected: {formData[question.question_id]}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  </Box>
                ))}

              {wantParticipants && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Participants</Typography>

                  {participants.map((participant, index) => (
                    <Grid
                      container
                      spacing={2}
                      style={{ marginTop: 10 }}
                      alignItems="center"
                      key={participant.id}
                    >
                      {extraFields.map((field, fieldIndex) => (
                        <Grid item xs={5} key={fieldIndex}>
                          <TextField
                            fullWidth
                            label={field.label}
                            type={field.type}
                            value={participant[field.label] || ""}
                            onChange={(e) =>
                              updateParticipant(
                                index,
                                field.label,
                                e.target.value
                              )
                            }
                          />
                        </Grid>
                      ))}
                      <Grid item xs={2}>
                        <IconButton
                          color="red"
                          onClick={() => deleteParticipant(participant.id)}
                        >
                          <img style={{ width: 30 }} src={deleteIcon} />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={addParticipant}
                    sx={{ mt: 2 }}
                  >
                    Add Participant
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Signature</Typography>
                <SignatureCanvas
                  ref={(ref) => setSign(ref)}
                  penColor="black"
                  canvasProps={{
                    style: {
                      maxWidth: "330px",
                      height: 200,
                      display: "block",
                      marginBottom: 10,
                    },
                    className: "sigCanvas",
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => sign?.clear()}
                  sx={{ mt: 1 }}
                >
                  Clear
                </Button>
              </Box>

              <Button
                variant="contained"
                type="submit"
                disabled={disabled}
                sx={{ mt: 3 }}
                fullWidth
              >
                Submit
              </Button>
            </form>
          </Paper>
        ) : (
          <></>
        )}
      </Box>
      {loading && (
        <div className="loader__container">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};

export default Form;
