import React, { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Stack,
} from "@mui/material";

const FormBuilder = () => {
  const [formFields, setFormFields] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [currentField, setCurrentField] = useState({
    label: "",
    input_type: "",
    required: false,
    image: "",
    values: "",
  });

  const inputTypes = [
    { value: "text", label: "Text Input" },
    { value: "dropdown", label: "Dropdown" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio" },
    { value: "date", label: "Date" },
    { value: "file", label: "File" },
    { value: "label", label: "Label Only" },
  ];

  const handleAddField = () => {
    const newField = { ...currentField };

    // Handle values for dropdown or radio
    if (currentField.input_type === "dropdown" || currentField.input_type === "radio") {
      newField.values = currentField.values.split(",").map((v) => v.trim());
    }

    setFormFields([...formFields, newField]);
    setCurrentField({ label: "", input_type: "", required: false, image: "", values: "" });
  };

  const handleAddExtraField = () => {
    setExtraFields([...extraFields, { label: "", type: "" }]);
  };

  const handleExtraFieldChange = (index, field, value) => {
    const updatedExtraFields = [...extraFields];
    updatedExtraFields[index][field] = value;
    setExtraFields(updatedExtraFields);
  };

  const handleSaveConfig = () => {
    const config = {
      template_name: "My Form Template",
      template_config: {
        questions: formFields,
        extra_participants_form_fields: extraFields,
      },
    };

    console.log("Generated Config:", JSON.stringify(config, null, 2));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Form Builder
      </Typography>

      {/* Field Inputs */}
      <Stack spacing={2}>
        <TextField
          label="Label"
          value={currentField.label}
          onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
        />

        <FormControl fullWidth>
          <InputLabel>Input Type</InputLabel>
          <Select
            value={currentField.input_type}
            onChange={(e) => setCurrentField({ ...currentField, input_type: e.target.value })}
          >
            {inputTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(currentField.input_type === "dropdown" || currentField.input_type === "radio") && (
          <TextField
            label="Options (comma-separated)"
            value={currentField.values}
            onChange={(e) => setCurrentField({ ...currentField, values: e.target.value })}
          />
        )}

        {currentField.input_type !== "label" && (
          <FormControlLabel
            control={
              <Checkbox
                checked={currentField.required}
                onChange={(e) => setCurrentField({ ...currentField, required: e.target.checked })}
              />
            }
            label="Required"
          />
        )}

        <TextField
          label="Image URL (Optional)"
          value={currentField.image}
          onChange={(e) => setCurrentField({ ...currentField, image: e.target.value })}
        />

        <Button variant="contained" onClick={handleAddField}>
          Add Field
        </Button>
      </Stack>

      {/* Added Fields */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Added Fields
        </Typography>
        {formFields.map((field, index) => (
          <Typography key={index}>{`${index + 1}. ${field.label} (${field.input_type})`}</Typography>
        ))}
      </Box>

      {/* Extra Participants Form Fields */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Extra Participants Form Fields
        </Typography>
        {extraFields.map((field, index) => (
          <Stack key={index} direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Field Label"
              value={field.label}
              onChange={(e) => handleExtraFieldChange(index, "label", e.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={field.type}
                onChange={(e) => handleExtraFieldChange(index, "type", e.target.value)}
              >
                {inputTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ))}
        <Button variant="outlined" onClick={handleAddExtraField}>
          Add Extra Field
        </Button>
      </Box>

      {/* Save Button */}
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleSaveConfig}>
          Save Config
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilder;
