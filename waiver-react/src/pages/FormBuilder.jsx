import React, { useState } from "react";
import { Box, Button, Typography, Paper, TextField, MenuItem } from "@mui/material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const FormBuilder = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  const availableComponents = [
    { id: "1", type: "TextField", label: "Text Field" },
    { id: "2", type: "Checkbox", label: "Checkbox" },
    { id: "3", type: "Dropdown", label: "Dropdown" },
  ];

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === "components" && destination.droppableId === "fields") {
      const newField = {
        id: Date.now().toString(),
        type: availableComponents[source.index].type,
        props: { label: availableComponents[source.index].label },
      };
      setFields([...fields, newField]);
    }
  };

  const handleFieldSelect = (fieldId) => {
    const field = fields.find((f) => f.id === fieldId);
    setSelectedField(field);
  };

  const handleFieldChange = (prop, value) => {
    if (selectedField) {
      const updatedFields = fields.map((field) =>
        field.id === selectedField.id ? { ...field, props: { ...field.props, [prop]: value } } : field
      );
      setFields(updatedFields);
      setSelectedField({ ...selectedField, props: { ...selectedField.props, [prop]: value } });
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Form Builder
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" gap={4}>
          {/* Available Components */}
          <Droppable droppableId="components">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ width: 200, p: 2, border: "1px solid #ddd", borderRadius: 2 }}
              >
                <Typography variant="h6">Components</Typography>
                {availableComponents.map((component, index) => (
                  <Draggable key={component.id} draggableId={component.id} index={index}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{ p: 2, mb: 1 }}
                      >
                        {component.label}
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>

          {/* Dropped Fields */}
          <Droppable droppableId="fields">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{ flex: 1, p: 2, border: "1px solid #ddd", borderRadius: 2 }}
              >
                <Typography variant="h6">Form Preview</Typography>
                {fields.map((field, index) => (
                  <Paper
                    key={field.id}
                    sx={{ p: 2, mb: 1, cursor: "pointer" }}
                    onClick={() => handleFieldSelect(field.id)}
                  >
                    {field.props.label || "Unnamed Field"}
                  </Paper>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>

          {/* Property Editor */}
          {selectedField && (
            <Box sx={{ width: 300, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
              <Typography variant="h6">Field Properties</Typography>
              <TextField
                fullWidth
                label="Label"
                value={selectedField.props.label || ""}
                onChange={(e) => handleFieldChange("label", e.target.value)}
                sx={{ mt: 2 }}
              />
              {selectedField.type === "Dropdown" && (
                <TextField
                  fullWidth
                  label="Options (comma-separated)"
                  value={selectedField.props.options?.join(", ") || ""}
                  onChange={(e) =>
                    handleFieldChange("options", e.target.value.split(",").map((opt) => opt.trim()))
                  }
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </Box>
      </DragDropContext>

      {/* Export Config */}
      <Button
        variant="contained"
        sx={{ mt: 4 }}
        onClick={() => console.log("Generated Config:", JSON.stringify(fields, null, 2))}
      >
        Export Config
      </Button>
    </Box>
  );
};

export default FormBuilder;
