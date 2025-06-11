// Form data management
const STORAGE_KEY = 'nys_forms_data';

// Initialize or get stored form data
function getStoredData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

// Save form data to local storage
function saveFormData(data) {
    const currentData = getStoredData();
    const updatedData = { ...currentData, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
}

// Load form data into fields
function loadFormData() {
    const data = getStoredData();
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name && data[input.name]) {
            if (input.type === 'radio') {
                if (input.value === data[input.name]) {
                    input.checked = true;
                }
            } else if (input.type === 'checkbox') {
                input.checked = data[input.name];
            } else {
                input.value = data[input.name];
            }
        }
    });
}

// Save form data when input changes
function setupFormListeners() {
    const form = document.querySelector('form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const data = {};
            if (input.type === 'radio') {
                if (input.checked) {
                    data[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                data[input.name] = input.checked;
            } else {
                data[input.name] = input.value;
            }
            saveFormData(data);
        });
    });
}

// Get current date in MM/DD/YYYY format
function getCurrentDate() {
    const now = new Date();
    return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
}

// Form Validation Functions
function validateField(field) {
    const fieldType = field.type;
    const fieldName = field.name;
    const fieldValue = field.value;
    const isRequired = field.hasAttribute('required');
    
    // Clear previous errors
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('has-error');
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }

    if (!isRequired && !fieldValue) {
        return true;
    }

    let isValid = true;
    let errorMessage = '';

    switch (fieldType) {
        case 'text':
            if (!fieldValue.trim()) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            break;

        case 'tel':
            if (field.pattern) {
                const pattern = new RegExp(field.pattern);
                if (!pattern.test(fieldValue)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number (e.g., 555-555-5555)';
                }
            }
            break;

        case 'radio':
            const radioGroup = document.getElementsByName(fieldName);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                errorMessage = 'Please select an option';
                // For radio buttons, add error to the parent group
                formGroup.classList.add('has-error');
            }
            break;

        case 'textarea':
            if (isRequired && !fieldValue.trim()) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            break;
    }

    if (!isValid) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = errorMessage;
        formGroup.appendChild(error);
        formGroup.classList.add('has-error');
    }

    return isValid;
}

function validateForm(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    let firstError = null;

    // Clear previous validation summary
    let validationSummary = form.querySelector('.validation-summary');
    if (validationSummary) {
        validationSummary.remove();
    }

    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
            if (!firstError) {
                firstError = field;
            }
        }
    });

    if (!isValid) {
        // Create validation summary
        validationSummary = document.createElement('div');
        validationSummary.className = 'validation-summary show';
        validationSummary.innerHTML = `
            <h3>Please correct the following errors:</h3>
            <p>All required fields must be filled in before proceeding.</p>
        `;
        form.insertBefore(validationSummary, form.firstChild);

        // Scroll to first error
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

// Handle form navigation
function handleFormNavigation(event, direction) {
    if (direction === 'next') {
        const form = event.target.closest('form');
        if (form && !validateForm(form)) {
            event.preventDefault();
            return false;
        }
    }
    return true;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    setupFormListeners();
    
    // Set current date for date fields
    const dateFields = document.querySelectorAll('input[type="date"]');
    dateFields.forEach(field => {
        if (!field.value) {
            field.value = getCurrentDate();
        }
    });
});
