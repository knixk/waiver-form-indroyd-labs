function generateForm(config) {
    const form = document.createElement('form');
  
    // Add company logo
    if (config.company_logo) {
      const logo = document.createElement('img');
      logo.src = config.company_logo;
      logo.alt = config.company_name;
      logo.style.display = 'block';
      logo.style.margin = '0 auto';
      form.appendChild(logo);
    }
  
    // Add company name and address
    if (config.company_name) {
      const companyName = document.createElement('h1');
      companyName.textContent = config.company_name;
      companyName.style.textAlign = 'center';
      form.appendChild(companyName);
    }
  
    if (config.company_address) {
      const companyAddress = document.createElement('p');
      companyAddress.textContent = config.company_address;
      companyAddress.style.textAlign = 'center';
      form.appendChild(companyAddress);
    }
  
    // Add questions
    config.questions.forEach((question) => {
      const wrapper = document.createElement('div');
      wrapper.style.marginBottom = '15px';
  
      // Apply custom styles if provided
      if (question.customStyles) {
        Object.assign(wrapper.style, question.customStyles);
      }
  
      if (question.label) {
        const label = document.createElement('label');
        label.textContent = question.label;
        label.style.fontWeight = question.bold ? 'bold' : 'normal';
        label.style.color = question.color || 'inherit';
        label.style.fontSize = question.fontSize || 'inherit';
        wrapper.appendChild(label);
      }
  
      let input;
      switch (question.input_type) {
        case 'label':
          // Labels are already handled above
          break;
        case 'text':
          input = document.createElement('input');
          input.type = question.variant || 'text';
          input.placeholder = question.input_placeholder || '';
          input.required = question.required || false;
          break;
        case 'dropdown':
          input = document.createElement('select');
          question.values.forEach((value) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            input.appendChild(option);
          });
          input.required = question.required || false;
          break;
        case 'checkbox':
          input = document.createElement('input');
          input.type = 'checkbox';
          input.required = question.required || false;
          break;
        case 'radio':
          question.values.forEach((value) => {
            const radioWrapper = document.createElement('div');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = question.question_id;
            radio.value = value;
            radio.required = question.required || false;
  
            const radioLabel = document.createElement('label');
            radioLabel.textContent = value;
  
            radioWrapper.appendChild(radio);
            radioWrapper.appendChild(radioLabel);
            wrapper.appendChild(radioWrapper);
          });
          break;
        default:
          console.warn(`Unsupported input type: ${question.input_type}`);
      }
  
      if (input) {
        wrapper.appendChild(input);
      }
  
      form.appendChild(wrapper);
    });
  
    // Add extra participant fields if enabled
    if (config.want_to_add_participants && config.extra_participants_form_fields) {
      const extraFieldsWrapper = document.createElement('div');
      extraFieldsWrapper.style.marginTop = '20px';
  
      config.extra_participants_form_fields.forEach((field) => {
        const fieldWrapper = document.createElement('div');
        const label = document.createElement('label');
        label.textContent = field.label;
  
        let input;
        switch (field.type) {
          case 'text':
            input = document.createElement('input');
            input.type = 'text';
            break;
          case 'dropdown':
            input = document.createElement('select');
            break;
          case 'date':
            input = document.createElement('input');
            input.type = 'date';
            break;
          default:
            console.warn(`Unsupported field type: ${field.type}`);
        }
  
        if (input) {
          fieldWrapper.appendChild(label);
          fieldWrapper.appendChild(input);
        }
        extraFieldsWrapper.appendChild(fieldWrapper);
      });
  
      form.appendChild(extraFieldsWrapper);
    }
  
    return form;
  }
  
  // Example usage
  document.body.appendChild(generateForm(yourConfig));
  