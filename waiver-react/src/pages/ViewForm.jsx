import { useEffect } from "react";
import axios from "axios";

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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

import deleteIcon from "../assets/delete.png";
import placeholderImg from "../assets/placeholder.jpg";


const uri =
  import.meta.env.VITE_MODE == "prod"
    ? import.meta.env.VITE_AWS_URI
    : import.meta.env.VITE_API_LOCAL_URI;

const ViewForm = () => {
  const myState = useContext(MyContext);
  const {
    loading,
    setLoading,
    companyName,
    setCompanyName,
    displayForm,
    setDisplayForm,
    extraFields,
    setExtraFields,
    questions,
    setQuestions,
    sign,
    formData,
    setFormData,
    companyLogo,
    setCompanyLogo,
    submissionID,
    viewParticipant,
    setErr,
    centerInfo,
    setCenterInfo,
  } = myState;

  const navigate = useNavigate();

  // console.log(viewParticipant, "vp");

  // console.log(centerInfo);

  if (!submissionID) {
    return (
      <section className="page_404">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 ">
              <div className="col-sm-10 col-sm-offset-1  text-center">
                <div className="four_zero_four_bg">
                  <h1 className="text-center ">Oops..</h1>
                </div>

                <div className="contant_box_404">
                  <h3 className="h2">Look like you're lost</h3>

                  <p>the form you are looking for is not available..</p>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      navigate("/");
                    }}
                  >
                    Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const temp = JSON.parse(viewParticipant.submission_data);

  const addParticipant = () => {};

  const handleChange = () => {};

  const deleteParticipant = (id) => {};

  const handleSubmit = async (e) => {};

  const handleInputChange = async (e) => {};

  useEffect(() => {
    // console.log("ue run");
    const fetchTemplateFromSID = async (submissionId) => {
      const templatefromSIDURL = `${uri}/template-from-sid`;
      try {
        const response = await axios.post(templatefromSIDURL, {
          submissionId,
        });

        // console.log(
        //   response.data.response.template[0].template_config,
        //   "m RESSO"
        // );
        // return;
        const tData = JSON.parse(
          response.data.response.template[0].template_config
        );

        setQuestions(tData.questions);
        setCompanyLogo(tData.company_logo);
        setExtraFields(tData.extra_participants_form_fields);
        setDisplayForm(true);
        setCompanyName(tData.company_name);

        setFormData(temp);
        setLoading(false);

        return response.data.template;
      } catch (error) {
        // console.error(
        //   "Error fetching template:",
        //   error.response?.data || error.message
        // );
      }
    };

    const postCenter = async (centerId) => {
      // console.log(centerId, "im ci");
      const center = `${uri}/get-center`;
      const options = {
        center_id: centerId,
      };

      try {
        const response = await axios.post(center, options);
        setCenterInfo(response.data.response.data);
        const addInfo = JSON.parse(response.data.response.data.additional_info);
        // console.log(centerInfo, "im cf");
        // setCenterAddInfo(addInfo);
        return response.data.data; // Return the response data
      } catch (error) {
        console.error(
          "Error posting center:",
          error.response?.data || error.message // Handle error gracefully
        );
        throw error; // Rethrow the error for further handling
      }
    };

    const asyncSt = async () => {
      await fetchTemplateFromSID(submissionID);

      viewParticipant && (await postCenter(viewParticipant.center_id));
    };

    asyncSt();
  }, []);

  return (
    <div className="form__container__main">
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
        {displayForm ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <div className="print__me">
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                align="center"
                color="black"
                marginTop={2}
                letterSpacing={1.5}
              >
                {/* {(formData && companyName) || "Company name"} */}

                {centerInfo && centerInfo.center_name}
              </Typography>
              {/* {formData && (
                <img className="form__logo" src={companyLogo} alt="" />
              )} */}

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

              <form
                onChange={handleChange}
                disabled={true}
                onSubmit={handleSubmit}
              >
                <TextField
                  fullWidth
                  label="Name"
                  margin="normal"
                  required
                  onChange={handleChange}
                  value={formData["fixed__name"]}
                />
                <TextField
                  fullWidth
                  label="Email"
                  margin="normal"
                  required
                  type="email"
                  onChange={handleChange}
                  value={formData["fixed__email"]}
                />
                <TextField
                  fullWidth
                  label="Mobile Number"
                  margin="normal"
                  required
                  type="tel"
                  onChange={handleChange}
                  value={formData["fixed__number"]}
                />
                {questions &&
                  questions.map((question) => (
                    <Box key={question.question_id} sx={{ mt: 2 }}>
                      {question.input_type === "label" && question.label && (
                        <FormControl component="fieldset" sx={{ mb: 2 }}>
                          <Typography
                            sx={{
                              fontSize: question.fontSize || "1rem", // Default size if not provided
                              color: question.color || "black", // Default color if not provided
                              fontWeight: question.bold ? "bold" : "normal", // Bold if specified
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
                          <Typography>{question.label}</Typography>
                          <TextField
                            type="text"
                            variant="outlined"
                            fullWidth
                            value={formData[question.question_id] || ""}
                            onChange={(e) =>
                              handleInputChange(
                                question.question_id,
                                e.target.value
                              )
                            }
                            placeholder={
                              question.input_placeholder ||
                              "Enter your response"
                            }
                            sx={{ mt: 2, ...question.customInputStyles }}
                          />
                        </FormControl>
                      )}

                      {question.input_type === "dropdown" && (
                        <FormControl fullWidth margin="normal">
                          <Typography>{question.label}</Typography>

                          <Select
                            onChange={handleChange}
                            value={formData[question.question_id] || ""}
                            displayEmpty
                          >
                            <MenuItem onChange={handleChange} value="" disabled>
                              Choose
                            </MenuItem>
                            {question.values.split(",").map((option) => (
                              <MenuItem
                                key={option}
                                onChange={handleChange}
                                value={option}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}

                      {question.input_type === "radio" && (
                        <FormControl component="fieldset">
                          <Typography>{question.label}</Typography>

                          <RadioGroup>
                            {question.values.split(",").map((option) => (
                              <FormControlLabel
                                disabled
                                key={option}
                                onChange={handleChange}
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
                              fontSize: question.fontSize || "1rem",
                              color: question.color || "black",
                              fontWeight: question.bold ? "bold" : "normal",
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
                            onChange={handleChange}
                            value={formData[question.question_id] || ""}
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
                              fontSize: question.fontSize || "1rem",
                              color: question.color || "black",
                              fontWeight: question.bold ? "bold" : "normal",
                              ...question.customStyles,
                            }}
                          >
                            {question.label}
                          </Typography>
                          <TextField
                            type="date"
                            variant="outlined"
                            fullWidth
                            onChange={handleChange}
                            value={formData[question.question_id] || ""}
                            sx={{
                              mt: 2,
                              ...question.customDateStyles,
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </FormControl>
                      )}

                      {question.input_type === "file" && (
                        <FormControl fullWidth margin="normal">
                          <Button
                            variant="contained"
                            component="label"
                            color="primary"
                            disabled={true}
                          >
                            Upload File
                            <input
                              type="file"
                              hidden
                              onChange={handleChange}
                              value={formData[question.id] || ""}
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

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Participants</Typography>

                  {formData.participants &&
                    formData.participants.map((participant, index) => (
                      <Grid
                        container
                        spacing={2}
                        style={{ marginTop: 10 }}
                        alignItems="center"
                        key={participant.id}
                      >
                        {extraFields.map((field, fieldIndex) => {
                          return (
                            <Grid item xs={5} key={fieldIndex}>
                              <TextField
                                fullWidth
                                label={field.label}
                                type={field.type}
                                onChange={handleChange}
                                value={participant[field.label] || ""} // Ensure `label` matches participant keys
                              />
                            </Grid>
                          );
                        })}
                        <Grid item xs={2}>
                          <IconButton
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
                    disabled={true}
                    sx={{ mt: 2 }}
                  >
                    Add Participant
                  </Button>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6">Signature</Typography>
                  <div className="signature-img__container">
                    {temp.signature_data && (
                      <img
                        className="sig__img"
                        src={temp.signature_data}
                        alt=""
                      />
                    )}
                  </div>
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
                  disabled={true}
                  sx={{ mt: 3 }}
                  fullWidth
                >
                  Submit
                </Button>
              </form>
            </div>
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

export default ViewForm;
