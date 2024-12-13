import React, { useState } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const FormBuilder = () => {
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
    fontSize: "",
    color: "",
    bold: false,
    italic: false,
    alignment: "",
    customStyles: {},
  });

  const handleAddQuestion = () => {
    setFormConfig((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }],
    }));
    setCurrentQuestion({
      label: "",
      input_type: "text",
      values: "",
      image: "",
      fontSize: "",
      color: "",
      bold: false,
      italic: false,
      alignment: "",
      customStyles: {},
    });
  };

  const handleRemoveQuestion = (id) => {
    setFormConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const handleCustomStylesChange = (field, value) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      customStyles: {
        ...prev.customStyles,
        [field]: value,
      },
    }));
  };

  const handleGenerateConfig = () => {
    // Building the final config object
    const finalConfig = {
      template_name: formConfig.templateName || "Default Template Name",
      template_config: {
        company_logo: formConfig.companyLogo || "",
        company_address: formConfig.companyAddress || "",
        questions: formConfig.questions.map((q) => ({
          label: q.label,
          values:
            q.input_type === "dropdown"
              ? q.values.split(",").map((v) => v.trim())
              : undefined,
          required: q.required || false,
          input_type: q.input_type,
          question_id: q.id || `question_${Date.now()}`,
          ...(q.image && { image: q.image }),
          ...(q.input_type === "text" && {
            input_placeholder: q.placeholder || "",
          }),
        })),
        extra_participants_form_fields: formConfig.extraParticipants || [],
      },
    };

    console.log(finalConfig); // Log the final config in the console
    alert("Final Config has been logged to the console!"); // Notify the user
  };

  return (
    <div>
      <Typography variant="h4">
        Form Builder
      </Typography>

      <div>
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
      </div>

      <div>
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
              const styles = JSON.parse(e.target.value);
              setCurrentQuestion((prev) => ({ ...prev, customStyles: styles }));
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
      </div>

      <div>
        <Typography variant="h5">Preview</Typography>
        {formConfig.questions.map((question) => (
          <div key={question.id} style={{ marginBottom: "20px" }}>
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
              onClick={() => handleRemoveQuestion(question.id)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={() => handleGenerateConfig()}
      >
        Generate and Log Config
      </Button>
    </div>
  );
};

export default FormBuilder;
