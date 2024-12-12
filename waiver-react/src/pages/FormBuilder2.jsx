import React, { useState } from "react";

const FormBuilder = () => {
  const [templateName, setTemplateName] = useState("");
  const [formQuestions, setFormQuestions] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [extraFields, setExtraFields] = useState([]);
  const [generatedConfig, setGeneratedConfig] = useState(null);

  // Handler to add a new question
  const addQuestion = () => {
    setFormQuestions([
      ...formQuestions,
      { label: "", input_type: "text", question_id: "", required: false },
    ]);
  };

  // Handler for generating the configuration
  const generateConfig = () => {
    const config = {
      template_name: templateName,
      template_config: {
        questions: formQuestions,
        extra_participants_form_fields: extraFields,
        company_logo: logoUrl,
        company_name: companyName,
        company_address: companyAddress,
        want_to_add_participants: true,
      },
    };
    setGeneratedConfig(config);
  };

  // Handler for downloading the configuration
  const downloadConfig = () => {
    if (!generatedConfig) {
      alert("Please generate the config first!");
      return;
    }
    const blob = new Blob([JSON.stringify(generatedConfig, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Form Builder</h2>
      {/* Template Name */}
      <div>
        <label>Template Name:</label>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>

      {/* Company Details */}
      <div>
        <label>Company Logo URL:</label>
        <input
          type="text"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
      </div>
      <div>
        <label>Company Name:</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>
      <div>
        <label>Company Address:</label>
        <input
          type="text"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
        />
      </div>

      {/* Questions Section */}
      <h3>Questions</h3>
      {formQuestions.map((question, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <label>Label:</label>
          <input
            type="text"
            value={question.label}
            onChange={(e) => {
              const updatedQuestions = [...formQuestions];
              updatedQuestions[index].label = e.target.value;
              setFormQuestions(updatedQuestions);
            }}
          />
          <label>Input Type:</label>
          <select
            value={question.input_type}
            onChange={(e) => {
              const updatedQuestions = [...formQuestions];
              updatedQuestions[index].input_type = e.target.value;
              setFormQuestions(updatedQuestions);
            }}
          >
            <option value="text">Text</option>
            <option value="dropdown">Dropdown</option>
            <option value="radio">Radio</option>
            <option value="checkbox">Checkbox</option>
            <option value="image">Image</option>
          </select>
          <label>Required:</label>
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => {
              const updatedQuestions = [...formQuestions];
              updatedQuestions[index].required = e.target.checked;
              setFormQuestions(updatedQuestions);
            }}
          />
        </div>
      ))}
      <button onClick={addQuestion}>Add Question</button>

      {/* Extra Fields */}
      <h3>Extra Participants Fields</h3>
      <button
        onClick={() =>
          setExtraFields([
            ...extraFields,
            { id: Date.now(), type: "text", label: "New Field" },
          ])
        }
      >
        Add Extra Field
      </button>

      {/* Generate and Download Config */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={generateConfig}>Generate Config</button>
        <button onClick={downloadConfig}>Download Config</button>
      </div>

      {/* Display Generated Config */}
      {generatedConfig && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Config</h3>
          <pre>{JSON.stringify(generatedConfig, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
