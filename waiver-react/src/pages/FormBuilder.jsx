import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const FormBuilder = () => {
  const [formFields, setFormFields] = useState([]);
  const [extraParticipantsFields, setExtraParticipantsFields] = useState([]);
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [templateName, setTemplateName] = useState("");

  const addFormField = (type) => {
    const newField = {
      label: "",
      input_type: type,
      question_id: `field_${Date.now()}`,
      optional_date: null,
      optional_file: null,
      optional_image: null,
      ...(type === "dropdown" || type === "radio" ? { values: [] } : {}),
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (index, key, value) => {
    const updatedFields = [...formFields];
    updatedFields[index][key] = value;
    setFormFields(updatedFields);
  };

  const addOptionsToField = (index, options) => {
    const updatedFields = [...formFields];
    const parsedOptions = options
      .split(",")
      .map((option) => option.trim())
      .filter((option) => option);
    updatedFields[index].values = parsedOptions;
    setFormFields(updatedFields);
  };

  const generateTemplate = () => {
    const template = {
      template_name: templateName,
      template_config: {
        questions: formFields,
        extra_participants_form_fields: extraParticipantsFields,
        company_logo: companyLogo,
        company_name: companyName,
        company_address: companyAddress,
        want_to_add_participants: extraParticipantsFields.length > 0,
      },
    };

    console.log(JSON.stringify(template, null, 2)); // Log the template to the console
    return template;
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Form Builder
      </Typography>
      <TextField
        fullWidth
        label="Template Name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        sx={{ marginBottom: "10px" }}
      />
      <TextField
        fullWidth
        label="Company Logo URL"
        value={companyLogo}
        onChange={(e) => setCompanyLogo(e.target.value)}
        sx={{ marginBottom: "10px" }}
      />
      <TextField
        fullWidth
        label="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        sx={{ marginBottom: "10px" }}
      />
      <TextField
        fullWidth
        label="Company Address"
        value={companyAddress}
        onChange={(e) => setCompanyAddress(e.target.value)}
        sx={{ marginBottom: "20px" }}
      />

      <Typography variant="h6" gutterBottom>
        Form Fields
      </Typography>
      {formFields.map((field, index) => (
        <Paper key={field.question_id} sx={{ padding: "10px", marginBottom: "10px" }}>
          <TextField
            fullWidth
            label="Label"
            value={field.label}
            onChange={(e) => updateField(index, "label", e.target.value)}
            sx={{ marginBottom: "10px" }}
          />
          {["dropdown", "radio"].includes(field.input_type) && (
            <TextField
              fullWidth
              label="Add Options (comma-separated)"
              onBlur={(e) => {
                addOptionsToField(index, e.target.value);
                e.target.value = ""; // Clear input after adding options
              }}
              sx={{ marginBottom: "10px" }}
            />
          )}
          {field.values && (
            <Box sx={{ marginBottom: "10px" }}>
              {field.values.map((value, i) => (
                <Typography
                  key={i}
                  variant="body2"
                  sx={{
                    display: "inline-block",
                    marginRight: "5px",
                    padding: "2px 5px",
                    background: "#ddd",
                    borderRadius: "4px",
                  }}
                >
                  {value}
                </Typography>
              ))}
            </Box>
          )}
          <TextField
            fullWidth
            type="date"
            label="Optional Date"
            InputLabelProps={{ shrink: true }}
            onChange={(e) => updateField(index, "optional_date", e.target.value)}
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            type="file"
            onChange={(e) =>
              updateField(index, "optional_file", e.target.files[0]?.name || null)
            }
            sx={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            type="text"
            label="Optional Image URL"
            onChange={(e) => updateField(index, "optional_image", e.target.value)}
            sx={{ marginBottom: "10px" }}
          />
          <IconButton
            onClick={() =>
              setFormFields(formFields.filter((_, i) => i !== index))
            }
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      <Box sx={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button variant="outlined" onClick={() => addFormField("text")}>
          Add Text Field
        </Button>
        <Button variant="outlined" onClick={() => addFormField("dropdown")}>
          Add Dropdown Field
        </Button>
        <Button variant="outlined" onClick={() => addFormField("radio")}>
          Add Radio Field
        </Button>
        <Button variant="outlined" onClick={() => addFormField("checkbox")}>
          Add Checkbox Field
        </Button>
      </Box>

      <Button
        variant="contained"
        onClick={() => generateTemplate()}
        sx={{ marginTop: "20px" }}
      >
        Generate Template
      </Button>
    </Box>
  );
};

export default FormBuilder;
