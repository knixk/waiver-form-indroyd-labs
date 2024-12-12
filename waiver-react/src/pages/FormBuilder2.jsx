import React, { useState } from "react";

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
      ...(type === "dropdown" || type === "radio" ? { values: [] } : {}),
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (index, key, value) => {
    const updatedFields = [...formFields];
    updatedFields[index][key] = value;
    setFormFields(updatedFields);
  };

  const updateExtraParticipantField = (index, key, value) => {
    const updatedFields = [...extraParticipantsFields];
    updatedFields[index][key] = value;
    setExtraParticipantsFields(updatedFields);
  };

  const addOptionToField = (index, option) => {
    const updatedFields = [...formFields];
    if (!updatedFields[index].values) {
      updatedFields[index].values = [];
    }
    updatedFields[index].values.push(option);
    setFormFields(updatedFields);
  };

  const addExtraParticipantField = () => {
    const newField = {
      id: `extra_${Date.now()}`,
      type: "text",
      label: "",
    };
    setExtraParticipantsFields([...extraParticipantsFields, newField]);
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

    console.log(JSON.stringify(template, null, 2));
    return template;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Form Builder</h2>
      <input
        type="text"
        placeholder="Template Name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Company Logo URL"
        value={companyLogo}
        onChange={(e) => setCompanyLogo(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Company Address"
        value={companyAddress}
        onChange={(e) => setCompanyAddress(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <div>
        <h3>Form Fields</h3>
        {formFields.map((field, index) => (
          <div key={field.question_id} style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Label"
              value={field.label}
              onChange={(e) =>
                updateField(index, "label", e.target.value)
              }
              style={{ marginRight: "10px" }}
            />
            {["dropdown", "radio"].includes(field.input_type) && (
              <div>
                <input
                  type="text"
                  placeholder="Add Option"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addOptionToField(index, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  style={{ marginRight: "10px" }}
                />
                <div>
                  {field.values?.map((value, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        marginRight: "5px",
                        padding: "2px 5px",
                        background: "#ddd",
                        borderRadius: "4px",
                      }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() =>
                setFormFields(formFields.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button onClick={() => addFormField("text")}>Add Text Field</button>
        <button onClick={() => addFormField("dropdown")}>
          Add Dropdown Field
        </button>
        <button onClick={() => addFormField("radio")}>Add Radio Field</button>
        <button onClick={() => addFormField("checkbox")}>
          Add Checkbox Field
        </button>
        <button onClick={() => addFormField("label")}>Add Label</button>
      </div>
      <div>
        <h3>Extra Participants Form Fields</h3>
        {extraParticipantsFields.map((field, index) => (
          <div key={field.id} style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Label"
              value={field.label}
              onChange={(e) =>
                updateExtraParticipantField(index, "label", e.target.value)
              }
              style={{ marginRight: "10px" }}
            />
            <select
              value={field.type}
              onChange={(e) =>
                updateExtraParticipantField(index, "type", e.target.value)
              }
            >
              <option value="text">Text</option>
              <option value="dropdown">Dropdown</option>
              <option value="date">Date</option>
            </select>
            <button
              onClick={() =>
                setExtraParticipantsFields(
                  extraParticipantsFields.filter((_, i) => i !== index)
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button onClick={addExtraParticipantField}>
          Add Extra Participant Field
        </button>
      </div>
      <button
        onClick={() => {
          const template = generateTemplate();
          const blob = new Blob([JSON.stringify(template, null, 2)], {
            type: "application/json",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "template.json";
          link.click();
        }}
        style={{ marginTop: "20px" }}
      >
        Generate Template
      </button>
    </div>
  );
};

export default FormBuilder;
