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
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const uri =
  import.meta.env.VITE_MODE == "prod"
    ? import.meta.env.VITE_AWS_URI
    : import.meta.env.VITE_API_LOCAL_URI;

const FormBuilder = () => {
  const [extraParticipantFields, setExtraParticipantFields] = useState([]);

  const [formConfig, setFormConfig] = useState({
    templateName: "",
    companyLogo: "",
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    label: "",
    input_type: "text",
    values: "",
    image: "",
    required: false,
    variant: "",
  });

  // const [templates] = useState([
  //   { id: 1, name: "Template 1" },
  //   { id: 2, name: "Template 2" },
  //   { id: 3, name: "Template 3" },
  //   { id: 4, name: "Template 4" },
  //   { id: 6, name: "Flea Market" },
  // ]);

  const [check, setCheck] = useState(false);

  const [finalTemplate, setFinalTemplate] = useState({});

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

  const handleChange = (field, value) => {
    // console.log(formData, "Fd");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

    // uncomment this ---------------------
    try {
      const response = await axios.post(`${uri}/templates`, data);

      // console.log(response, "im res")
      const templateId = await response.data.response.template_id;
      // console.log(templateId);
      setFormData((prev) => ({
        ...prev,
        template_id: templateId,
      }));
      console.log("Template uploaded:", response.data);
      ans = await templateId;
      // return templateId;
    } catch (error) {
      console.error("Error uploading template:", error);
    }

    return ans;
  };

  // this function uploads the center, call it after the template is sent, and t_id is returned
  const uploadCenter = async (template_id) => {
    const newData = {
      ...formData,
      template_id: template_id,
    };

    console.log(newData, "im center_data");

    // uncomment this ------
    try {
      const response = await axios.post(`${uri}/centers`, newData);
      console.log("Center uploaded:", response.data);
    } catch (error) {
      console.error("Error uploading center:", error);
    }
  };

  const handleAddParticipantField = () => {
    setExtraParticipantFields([
      ...extraParticipantFields,
      { id: `field_${Date.now()}`, type: "text", label: "" },
    ]);
  };

  const handleRemoveParticipantField = (index) => {
    setExtraParticipantFields(
      extraParticipantFields.filter((_, i) => i !== index)
    );
  };

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

  const handleRemoveQuestion = (id) => {
    setFormConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.question_id !== id),
    }));
  };

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

    const config = {
      template_name: formConfig.templateName,
      template_config: {
        // company_logo: formConfig.companyLogo,
        // company_address: formConfig.companyAddress,
        questions: processedQuestions,
        extra_participants_form_fields: extraParticipantFields,
      },
    };

    setFinalTemplate(config);
    // downloadObjectAsJSON(config);
    const t_id = await uploadTemplate(config);
    // console.log("template id: ", t_id);
    // t_id && (await uploadCenter(t_id));
    await uploadCenter(6);

    // console.log(t_id, "yes");

    toast.success(`Center was submitted with template_id ${t_id}`);

    // console.log(config);
  };

  return (
    <Box p={2}>
      <Toaster />
      <Typography variant="h4">Form Builder</Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
        <h3>Center Information</h3>
        <TextField
          label="Center Name"
          fullWidth
          margin="normal"
          value={formData.center_name}
          onChange={(e) => handleChange("center_name", e.target.value)}
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
          onChange={(e) =>
            handleNestedChange("contact_info", "phone", e.target.value)
          }
        />
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
        <TextField
          label="Template Name"
          value={formConfig.templateName}
          onChange={(e) =>
            setFormConfig((prev) => ({ ...prev, templateName: e.target.value }))
          }
          fullWidth
          margin="normal"
        />
      </Paper>

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
        <Button sx={{ mt: 1 }} variant="contained" onClick={handleAddQuestion}>
          Add Question
        </Button>
      </Paper>

      <div>
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
      </div>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Extra Participant Fields
        </Typography>
        {extraParticipantFields.map((field, index) => (
          <Box
            key={index}
            sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <TextField
              fullWidth
              label="Field Label"
              value={field.label}
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

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => {
          handleGenerateConfig();
        }}
      >
        Generate and Log Config
      </Button>
    </Box>
  );
};

export default FormBuilder;

// const tempdata = {
//   fixed__name: "sadadasd",
//   fixed__email: "asdasd@asdasd",
//   fixed__number: "123123",
//   1735641542214: "asdasd",
//   1735641937724: true,
//   1735641962948: true,
//   1735642640100: "Arcade",
//   1735641606973: "123123123",
//   participants: [
//     {
//       id: "pr60CH_PdgxkiIiAtPet3",
//       "ChildName : ": "sdasdaasd",
//     },
//   ],
//   template_id: 47,
//   signature_data:
//     "data:image/png;base64,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",
//   center_id: 38,
// };
