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

const FormBuilder = () => {
  const [extraParticipantFields, setExtraParticipantFields] = useState([]);

  const [formConfig, setFormConfig] = useState({
    templateName: "",
    companyLogo: "",
    companyAddress: "",
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    label: "",
    input_type: "text",
    values: "",
    image: "",
    required: false,
    variant: "",
    customStyles: {},
  });

  const [check, setCheck] = useState(false);

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
      customStyles: {},
    });
  };

  const handleRemoveQuestion = (id) => {
    setFormConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.question_id !== id),
    }));
  };

  function downloadObjectAsJSON(obj, filename = "template_config.json") {
    // console.log("inside")
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  const handleCustomStylesChange = (field, value) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      customStyles: {
        ...prev.customStyles,
        [field]: value, // Update the specific field in customStyles
      },
    }));
  };

  const handleGenerateConfig = () => {
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
        company_logo: formConfig.companyLogo,
        company_address: formConfig.companyAddress,
        questions: processedQuestions,
        extra_participants_form_fields: extraParticipantFields,
      },
    };

    downloadObjectAsJSON(config);

    console.log(config);
  };

  return (
    <Box p={2}>
      <Typography variant="h4">Form Builder</Typography>

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
        <TextField
          label="Company Logo URL"
          value={formConfig.companyLogo}
          onChange={(e) =>
            setFormConfig((prev) => ({ ...prev, companyLogo: e.target.value }))
          }
          fullWidth
          margin="normal"
        />
        <TextField
          label="Company Address"
          value={formConfig.companyAddress}
          onChange={(e) =>
            setFormConfig((prev) => ({
              ...prev,
              companyAddress: e.target.value,
            }))
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

                console.log(currentQuestion);
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
        <TextField
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
        />
        <Button variant="contained" onClick={handleAddQuestion}>
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
                {/* <MenuItem value="dropdown">Dropdown</MenuItem> */}
                {/* <MenuItem value="date">Date</MenuItem> */}
                {/* <MenuItem value="file">File</MenuItem> */}
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
        onClick={() => handleGenerateConfig()}
      >
        Generate and Log Config
      </Button>
    </Box>
  );
};

export default FormBuilder;
