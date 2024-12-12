import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const FormBuilder = () => {
  const [templateInfo, setTemplateInfo] = useState({
    templateName: "",
    companyLogo: "",
    companyAddress: "",
  });

  const [questions, setQuestions] = useState([]);
  const [extraParticipants, setExtraParticipants] = useState([]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        label: "",
        input_type: "text",
        question_id: `question_${Date.now()}`,
        values: [],
        image: "",
      },
    ]);
  };

  const handleAddParticipantField = () => {
    setExtraParticipants([
      ...extraParticipants,
      {
        id: `participant_field_${Date.now()}`,
        type: "text",
        label: "",
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...extraParticipants];
    updatedParticipants[index][field] = value;
    setExtraParticipants(updatedParticipants);
  };

  const handleGenerateConfig = () => {
    const config = {
      template_name: templateInfo.templateName,
      template_config: {
        company_logo: templateInfo.companyLogo,
        company_address: templateInfo.companyAddress,
        questions,
        extra_participants_form_fields: extraParticipants,
      },
    };
    console.log(JSON.stringify(config, null, 2));
  };

  return (
    <Grid container spacing={3} padding={3}>
      {/* Template Info */}
      <Grid item xs={12}>
        <Typography variant="h5">Template Information</Typography>
        <TextField
          label="Template Name"
          fullWidth
          margin="normal"
          value={templateInfo.templateName}
          onChange={(e) =>
            setTemplateInfo({ ...templateInfo, templateName: e.target.value })
          }
        />
        <TextField
          label="Company Logo URL"
          fullWidth
          margin="normal"
          value={templateInfo.companyLogo}
          onChange={(e) =>
            setTemplateInfo({ ...templateInfo, companyLogo: e.target.value })
          }
        />
        <TextField
          label="Company Address"
          fullWidth
          margin="normal"
          value={templateInfo.companyAddress}
          onChange={(e) =>
            setTemplateInfo({ ...templateInfo, companyAddress: e.target.value })
          }
        />
      </Grid>

      {/* Questions Section */}
      <Grid item xs={12}>
        <Typography variant="h5">Form Questions</Typography>
        {questions.map((question, index) => (
          <Grid container spacing={2} key={question.question_id}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Question Label"
                fullWidth
                value={question.label}
                onChange={(e) =>
                  handleQuestionChange(index, "label", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Input Type</InputLabel>
                <Select
                  value={question.input_type}
                  onChange={(e) =>
                    handleQuestionChange(index, "input_type", e.target.value)
                  }
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="dropdown">Dropdown</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="file">File</MenuItem>
                  <MenuItem value="label">Label Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {question.input_type === "dropdown" && (
              <Grid item xs={12}>
                <TextField
                  label="Dropdown Options (comma-separated)"
                  fullWidth
                  value={question.values.join(", ")}
                  onChange={(e) =>
                    handleQuestionChange(
                      index,
                      "values",
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Image URL (Optional)"
                fullWidth
                value={question.image}
                onChange={(e) =>
                  handleQuestionChange(index, "image", e.target.value)
                }
              />
            </Grid>
          </Grid>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddQuestion}
          style={{ marginTop: "10px" }}
        >
          Add Question
        </Button>
      </Grid>

      {/* Extra Participants Section */}
      <Grid item xs={12}>
        <Typography variant="h5">Extra Participants Form Fields</Typography>
        {extraParticipants.map((field, index) => (
          <Grid container spacing={2} key={field.id}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Field Label"
                fullWidth
                value={field.label}
                onChange={(e) =>
                  handleParticipantChange(index, "label", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Field Type</InputLabel>
                <Select
                  value={field.type}
                  onChange={(e) =>
                    handleParticipantChange(index, "type", e.target.value)
                  }
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="file">File</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddParticipantField}
          style={{ marginTop: "10px" }}
        >
          Add Participant Field
        </Button>
      </Grid>

      {/* Generate Config */}
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleGenerateConfig}
        >
          Generate Config
        </Button>
      </Grid>
    </Grid>
  );
};

export default FormBuilder;
