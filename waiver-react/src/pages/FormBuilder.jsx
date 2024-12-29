import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  Divider,
  Box,
} from "@mui/material";
import axios from "axios";

const FormBuilder = () => {
  // State variables
  const [centerInfo, setCenterInfo] = useState({
    name: "",
    code: "",
    email: "",
  });

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "",
  });

  const [questions, setQuestions] = useState([]);
  const [participantFields, setParticipantFields] = useState([]);

  const [participantField, setParticipantField] = useState({
    name: "",
    type: "",
  });

  const [preview, setPreview] = useState(false);

  // Event Handlers
  const handleCenterInfoChange = (e) => {
    const { name, value } = e.target;
    setCenterInfo({ ...centerInfo, [name]: value });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const handleParticipantFieldChange = (e) => {
    const { name, value } = e.target;
    setParticipantField({ ...participantField, [name]: value });
  };

  const addQuestion = () => {
    if (newQuestion.question && newQuestion.type) {
      setQuestions([...questions, newQuestion]);
      setNewQuestion({ question: "", type: "" });
    }
  };

  const addParticipantField = () => {
    if (participantField.name && participantField.type) {
      setParticipantFields([...participantFields, participantField]);
      setParticipantField({ name: "", type: "" });
    }
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  const handleSubmit = async () => {
    const formData = {
      centerInfo,
      questions,
      participantFields,
    };
    try {
      const response = await axios.post("/api/form", formData);
      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Form Builder
      </Typography>

      {/* Center Information */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Center Information</Typography>
          <TextField
            label="Name"
            name="name"
            value={centerInfo.name}
            onChange={handleCenterInfoChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Code"
            name="code"
            value={centerInfo.code}
            onChange={handleCenterInfoChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={centerInfo.email}
            onChange={handleCenterInfoChange}
            fullWidth
            margin="normal"
          />
        </CardContent>
      </Card>

      {/* Add Question */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Add Question</Typography>
          <TextField
            label="Question"
            name="question"
            value={newQuestion.question}
            onChange={handleQuestionChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={newQuestion.type}
              onChange={handleQuestionChange}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={addQuestion}
            fullWidth
          >
            Add Question
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      <List>
        {questions.map((q, index) => (
          <ListItem key={index}>
            <Typography>
              {index + 1}. {q.question} ({q.type})
            </Typography>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 4 }} />

      {/* Participant Fields */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Participant Fields</Typography>
          <TextField
            label="Field Name"
            name="name"
            value={participantField.name}
            onChange={handleParticipantFieldChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={participantField.type}
              onChange={handleParticipantFieldChange}
            >
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="date">Date</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            onClick={addParticipantField}
            fullWidth
          >
            Add Participant Field
          </Button>
        </CardContent>
      </Card>

      <List>
        {participantFields.map((field, index) => (
          <ListItem key={index}>
            <Typography>
              {index + 1}. {field.name} ({field.type})
            </Typography>
          </ListItem>
        ))}
      </List>

      {/* Preview & Submit */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="info"
          onClick={togglePreview}
          sx={{ mr: 2 }}
        >
          {preview ? "Hide" : "Show"} Preview
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
        >
          Submit Form
        </Button>

        {preview && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6">Form Preview</Typography>
              <Typography>Name: {centerInfo.name}</Typography>
              <Typography>Code: {centerInfo.code}</Typography>
              <Typography>Email: {centerInfo.email}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Questions
              </Typography>
              {questions.map((q, index) => (
                <Typography key={index}>
                  {index + 1}. {q.question} ({q.type})
                </Typography>
              ))}

              <Typography variant="h6" sx={{ mt: 2 }}>
                Participant Fields
              </Typography>
              {participantFields.map((field, index) => (
                <Typography key={index}>
                  {index + 1}. {field.name} ({field.type})
                </Typography>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default FormBuilder;
