import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  InputLabel,
  FormControl,
} from "@mui/material";

import { Delete } from "@mui/icons-material";
// XXXX - DONT COMMENT AXIOS
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const uri =
  import.meta.env.VITE_MODE == "prod"
    ? import.meta.env.VITE_AWS_URI
    : import.meta.env.VITE_API_LOCAL_URI;

const placeholderImgURL = `https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png`;

const FormBuilder = () => {
  const [extraParticipantFields, setExtraParticipantFields] = useState([]);
  const [wantParticipants, setWantParticipants] = useState(true);

  // this is the template data, basically,
  // participants aren't mandatory right..

  const [formConfig, setFormConfig] = useState({
    templateName: "",
    companyLogo: "",
    questions: [],
  });

  // this is the center data
  const [formData, setFormData] = useState({
    center_name: "",
    address: "",
    contact_info: {
      email: "",
      phone: "",
    },
    template_id: "",
    additional_info: {
      intro: "",
      img: "",
    },
  });

  // this is the current question's state
  const [currentQuestion, setCurrentQuestion] = useState({
    label: "",
    input_type: "text",
    values: "",
    image: "",
    required: false,
    variant: "",
  });

  const [check, setCheck] = useState(false);

  const [finalTemplate, setFinalTemplate] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // not sure where it's being used
  const handleNestedChange = (nestedField, subField, value) => {
    // console.log(formData);

    setFormData((prev) => ({
      ...prev,
      [nestedField]: {
        ...prev[nestedField],
        [subField]: value,
      },
    }));
  };

  // this function uploads template to backend, and returns a template id
  const uploadTemplate = async (data) => {
    console.log(data, "im template data");
    let ans;

    // XXXX - DONT DELETE ME: uncomment this ---------------------
    // try {
    //   const response = await axios.post(`${uri}/templates`, data);

    //   // console.log(response, "im res")
    //   const templateId = await response.data.response.template_id;
    //   // console.log(templateId);
    //   setFormData((prev) => ({
    //     ...prev,
    //     template_id: templateId,
    //   }));
    //   console.log("Template uploaded:", response.data);
    //   ans = await templateId;
    //   return templateId;
    // } catch (error) {
    //   console.error("Error uploading template:", error);
    // }

    // return ans;
    // XXXX - DONT DELETE ME: uncomment this ---------------------
  };

  // this function uploads the center, call it after the template is sent, and t_id is returned
  const uploadCenter = async (template_id) => {
    const newData = {
      ...formData,
      template_id: template_id,
    };

    console.log(newData, "im center_data");

    // XXXX - DONT DELETE ME: uncomment this ------------------
    // try {
    //   const response = await axios.post(`${uri}/centers`, newData);
    //   console.log("Center uploaded:", response.data);
    // } catch (error) {
    //   console.error("Error uploading center:", error);
    // }
    // XXXX - DONT DELETE ME: uncomment this ---------------------
  };

  // adds participants question
  const handleAddParticipantField = () => {
    setExtraParticipantFields([
      ...extraParticipantFields,
      { id: `field_${Date.now()}`, type: "text", label: "" },
    ]);
  };

  // removes participant question
  const handleRemoveParticipantField = (index) => {
    setExtraParticipantFields(
      extraParticipantFields.filter((_, i) => i !== index)
    );
  };

  // adds the question
  const handleAddQuestion = () => {
    setFormConfig((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { ...currentQuestion, question_id: Date.now() },
      ],
    }));

    setCurrentQuestion({
      label: "",
      input_type: "text",
      values: "",
      image: "",
      required: false,
    });
  };

  // removes the question
  const handleRemoveQuestion = (id) => {
    setFormConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.question_id !== id),
    }));
  };

  // downloads the template data to your pc
  // function downloadObjectAsJSON(obj, filename = "template_config.json") {
  //   // console.log("inside")
  //   const blob = new Blob([JSON.stringify(obj, null, 2)], {
  //     type: "application/json",
  //   });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = filename;
  //   link.click();
  // }

  // handler for the final button, which uploads and sends center & template
  const handleGenerateConfig = async () => {
    setCurrentQuestion((currentQuestion) => ({
      ...currentQuestion,
      required: check, // Use the string "required" as the key
    }));

    const processedQuestions = formConfig.questions.map((question) => {
      // Merge predefined styles into customStyles
      const mergedStyles = {
        ...question.customStyles,
        ...(question.fontSize && { fontSize: question.fontSize }),
        ...(question.color && { color: question.color }),
        ...(question.bold && { fontWeight: "bold" }),
        ...(question.italic && { fontStyle: "italic" }),
        ...(question.alignment && { textAlign: question.alignment }),
      };

      return {
        ...question,
        customStyles: mergedStyles,
      };
    });

    // if (wantParticipants) {

    // }

    // we're checking if they have added any fields for extra participants, if no then we set it to false
    if (extraParticipantFields.length == 0) {
      console.log("empty");
      setWantParticipants(false);
    } else {
      console.log("not empty");
    }

    // it contains the template payload to be send to uploadTemplate
    const config = {
      template_name: formConfig.templateName,
      template_config: {
        questions: processedQuestions,
        extra_participants_form_fields: extraParticipantFields,
        want_participants: wantParticipants,
      },
    };

    setFinalTemplate(config);
    // uncomment to download
    // downloadObjectAsJSON(config);

    // we get back the template id, and use it to give it to the center and upload it too.
    const t_id = await uploadTemplate(config);
    console.log("template id: ", t_id);
    t_id && (await uploadCenter(t_id));
    toast.success(`Center was submitted with template_id ${t_id}`);

    console.log(config, "im the template");
  };

  return (
    <Box p={2}>
      <Toaster />
      <Typography variant="h4">Form Builder</Typography>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerateConfig();
          console.log("submitted");
        }}
      >
        {/* ----- This paper contains the center form ----- */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
          <h3>Center Information</h3>
          <TextField
            label="Center Name"
            fullWidth
            margin="normal"
            value={formData.center_name}
            onChange={(e) => handleChange("center_name", e.target.value)}
            required
          />
          <TextField
            label="Center Logo URL"
            fullWidth
            margin="normal"
            value={formData.additional_info.img}
            onChange={(e) =>
              handleNestedChange("additional_info", "img", e.target.value)
            }
          />
          <TextField
            label="Center Address"
            fullWidth
            margin="normal"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <TextField
            label="Center Details Info"
            fullWidth
            margin="normal"
            value={formData.additional_info.intro}
            onChange={(e) =>
              handleNestedChange("additional_info", "intro", e.target.value)
            }
          />
          <TextField
            label="Center Email"
            fullWidth
            margin="normal"
            value={formData.contact_info.email}
            onChange={(e) =>
              handleNestedChange("contact_info", "email", e.target.value)
            }
          />
          <TextField
            label="Center Phone"
            fullWidth
            margin="normal"
            value={formData.contact_info.phone}
            required
            onChange={(e) =>
              handleNestedChange("contact_info", "phone", e.target.value)
            }
          />
        </Paper>

        {/* ----- This paper contains the template form ----- */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
          <TextField
            label="Template Name"
            value={formConfig.templateName}
            onChange={(e) =>
              setFormConfig((prev) => ({
                ...prev,
                templateName: e.target.value,
              }))
            }
            fullWidth
            margin="normal"
            required
          />
        </Paper>

        {/* ----- This paper contains the question form ----- */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
          <Typography variant="h5">Add Question</Typography>
          <TextField
            label="Label"
            value={currentQuestion.label}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({ ...prev, label: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          {/* Input type dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Input Type</InputLabel>
            <Select
              value={currentQuestion.input_type}
              onChange={(e) =>
                setCurrentQuestion((prev) => ({
                  ...prev,
                  input_type: e.target.value,
                }))
              }
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="textarea">Textarea</MenuItem>
              <MenuItem value="dropdown">Dropdown</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="file">File</MenuItem>
              <MenuItem value="label">Label</MenuItem>
              <MenuItem value="radio">Radio</MenuItem>
              <MenuItem value="checkbox">Checkbox</MenuItem>
            </Select>
          </FormControl>

          {/* Variant dropdown */}
          {currentQuestion.input_type == "text" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Variant</InputLabel>
              <Select
                value={currentQuestion.variant}
                onChange={(e) => {
                  setCurrentQuestion((prev) => ({
                    ...prev,
                    variant: e.target.value,
                  }));

                  // console.log(currentQuestion);
                }}
              >
                <MenuItem value="text">Default</MenuItem>
                <MenuItem value="phone_number">Phone Number</MenuItem>
                <MenuItem value="zip_code">Zip Code</MenuItem>
                <MenuItem value="password">Password</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </Select>
            </FormControl>
          )}

          {currentQuestion.input_type === "dropdown" && (
            <TextField
              label="Values (comma separated)"
              value={currentQuestion.values}
              onChange={(e) =>
                setCurrentQuestion((prev) => ({
                  ...prev,
                  values: e.target.value,
                }))
              }
              fullWidth
              margin="normal"
            />
          )}

          {currentQuestion.input_type === "radio" && (
            <TextField
              label="Values (comma separated)"
              value={currentQuestion.values}
              onChange={(e) =>
                setCurrentQuestion((prev) => ({
                  ...prev,
                  values: e.target.value,
                }))
              }
              fullWidth
              margin="normal"
            />
          )}
          <Typography>
            Required
            <Checkbox
              name="required__check"
              onChange={() => {
                setCheck(!check);
              }}
              checked={check} // Ensures it shows the correct state
              // onChange={() => }
            />
          </Typography>

          <TextField
            label="Image URL (optional)"
            value={currentQuestion.image}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({ ...prev, image: e.target.value }))
            }
            fullWidth
            margin="normal"
          />

          <TextField
            label="Font Size (e.g., 1rem, 1.5rem)"
            value={currentQuestion.fontSize}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({
                ...prev,
                fontSize: e.target.value,
              }))
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Text Color (e.g., red, #000000)"
            value={currentQuestion.color}
            onChange={(e) =>
              setCurrentQuestion((prev) => ({ ...prev, color: e.target.value }))
            }
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={currentQuestion.bold}
                onChange={(e) =>
                  setCurrentQuestion((prev) => ({
                    ...prev,
                    bold: e.target.checked,
                  }))
                }
              />
            }
            label="Bold"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={currentQuestion.italic}
                onChange={(e) =>
                  setCurrentQuestion((prev) => ({
                    ...prev,
                    italic: e.target.checked,
                  }))
                }
              />
            }
            label="Italic"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Text Alignment</InputLabel>
            <Select
              value={currentQuestion.alignment}
              onChange={(e) =>
                setCurrentQuestion((prev) => ({
                  ...prev,
                  alignment: e.target.value,
                }))
              }
            >
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </Select>
          </FormControl>
          {/* <TextField
          label="Custom Styles (JSON format)"
          value={JSON.stringify(currentQuestion.customStyles, null, 2)}
          onChange={(e) => {
            try {
              // Attempt to parse the entered value
              const styles = JSON.parse(e.target.value);

              // Check if the parsed styles are valid and an object
              if (typeof styles === "object" && styles !== null) {
                setCurrentQuestion((prev) => ({
                  ...prev,
                  customStyles: styles,
                }));
              } else {
                console.error("Parsed value is not a valid object.");
              }
            } catch {
              console.error("Invalid JSON");
            }
          }}
          fullWidth
          margin="normal"
          multiline
        /> */}
          <Button
            sx={{ mt: 1 }}
            variant="contained"
            onClick={handleAddQuestion}
          >
            Add Question
          </Button>
        </Paper>

        {/* ----- This paper contains the preview of all questions ----- */}
        <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
          <Typography sx={{ mb: 2, mt: 3 }} variant="h5">
            Preview
          </Typography>
          {formConfig.questions.map((question) => (
            <div key={question.question_id} style={{ marginBottom: "20px" }}>
              {question.image && (
                <img src={question.image} alt="" style={{ maxWidth: "100%" }} />
              )}
              <Typography
                sx={{
                  fontSize: question.fontSize || "1rem",
                  color: question.color || "black",
                  fontWeight: question.bold ? "bold" : "normal",
                  fontStyle: question.italic ? "italic" : "normal",
                  textAlign: question.alignment || "left",
                  ...question.customStyles,
                }}
              >
                {question.label}
              </Typography>
              {question.input_type === "text" && (
                <TextField fullWidth margin="normal" />
              )}
              {question.input_type === "textarea" && (
                <TextField fullWidth margin="normal" multiline rows={4} />
              )}
              {question.input_type === "dropdown" && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>{question.label}</InputLabel>
                  <Select>
                    {question.values.split(",").map((value, index) => (
                      <MenuItem key={index} value={value.trim()}>
                        {value.trim()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {question.input_type === "date" && (
                <TextField type="date" fullWidth margin="normal" />
              )}
              {question.input_type === "file" && (
                <TextField type="file" fullWidth margin="normal" />
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveQuestion(question.question_id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </Paper>

        {/* ----- This paper contains the extra participants form ----- */}
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Extra Participant Fields
          </Typography>
          {extraParticipantFields.map((field, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 2,
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <TextField
                fullWidth
                label="Field Label"
                value={field.label}
                required
                onChange={(e) => {
                  const newFields = [...extraParticipantFields];
                  newFields[index].label = e.target.value;
                  setExtraParticipantFields(newFields);
                }}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={field.type}
                  onChange={(e) => {
                    const newFields = [...extraParticipantFields];
                    newFields[index].type = e.target.value;
                    setExtraParticipantFields(newFields);
                  }}
                >
                  <MenuItem value="text">Text</MenuItem>
                </Select>
              </FormControl>
              <IconButton
                color="error"
                onClick={() => handleRemoveParticipantField(index)}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button variant="contained" onClick={handleAddParticipantField}>
            Add Participant Field
          </Button>
        </Paper>

        {/* ----- This is the submit button ----- */}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          type="submit"
          // onClick={() => {
          //   handleGenerateConfig();
          // }}
        >
          Generate and Log Config
        </Button>
      </form>
    </Box>
  );
};

export default FormBuilder;
