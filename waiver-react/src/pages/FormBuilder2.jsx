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
  const [questions, setQuestions] = useState([]);
  const [extraParticipantFields, setExtraParticipantFields] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        label: "",
        input_type: "text",
        question_id: `question_${Date.now()}`,
        required: false,
        image: "",
        options: [],
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleAddParticipantField = () => {
    setExtraParticipantFields([
      ...extraParticipantFields,
      { id: `field_${Date.now()}`, type: "text", label: "" },
    ]);
  };

  const handleRemoveParticipantField = (index) => {
    setExtraParticipantFields(extraParticipantFields.filter((_, i) => i !== index));
  };

  const handleDownloadConfig = () => {
    const config = {
      template_name: templateName,
      template_config: {
        questions,
        extra_participants_form_fields: extraParticipantFields,
        company_logo: companyLogo,
        company_name: "Fun City Adventure Park",
        company_address: companyAddress,
        want_to_add_participants: true,
      },
    };
    console.log(config);
  };

  return (
    <Box p={2}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Template Configuration
        </Typography>
        <TextField
          fullWidth
          label="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Company Logo URL"
          value={companyLogo}
          onChange={(e) => setCompanyLogo(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Company Address"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Questions
        </Typography>
        {questions.map((question, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
            <TextField
              fullWidth
              label="Question Label"
              value={question.label}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].label = e.target.value;
                setQuestions(newQuestions);
              }}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Input Type</InputLabel>
              <Select
                value={question.input_type}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[index].input_type = e.target.value;
                  setQuestions(newQuestions);
                }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
                <MenuItem value="radio">Radio</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="file">File</MenuItem>
                <MenuItem value="label">Label</MenuItem>
              </Select>
            </FormControl>

            {question.input_type === "dropdown" || question.input_type === "radio" ? (
              <TextField
                fullWidth
                label="Options (comma separated)"
                value={question.options.join(",")}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[index].options = e.target.value.split(",").map((opt) => opt.trim());
                  setQuestions(newQuestions);
                }}
                sx={{ mb: 2 }}
              />
            ) : null}

            <FormControlLabel
              control={
                <Checkbox
                  checked={question.required}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].required = e.target.checked;
                    setQuestions(newQuestions);
                  }}
                />
              }
              label="Required"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Image URL (Optional)"
              value={question.image}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[index].image = e.target.value;
                setQuestions(newQuestions);
              }}
              sx={{ mb: 2 }}
            />

            <IconButton color="error" onClick={() => handleRemoveQuestion(index)}>
              <Delete />
            </IconButton>
          </Box>
        ))}
        <Button variant="contained" onClick={handleAddQuestion}>
          Add Question
        </Button>
      </Paper>

      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Extra Participant Fields
        </Typography>
        {extraParticipantFields.map((field, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "4px" }}>
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
                <MenuItem value="dropdown">Dropdown</MenuItem>
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="file">File</MenuItem>
              </Select>
            </FormControl>
            <IconButton color="error" onClick={() => handleRemoveParticipantField(index)}>
              <Delete />
            </IconButton>
          </Box>
        ))}
        <Button variant="contained" onClick={handleAddParticipantField}>
          Add Participant Field
        </Button>
      </Paper>

      <Button variant="contained" color="primary" onClick={handleDownloadConfig}>
        Log Config
      </Button>
    </Box>
  );
};

export default FormBuilder;
