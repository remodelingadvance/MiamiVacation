export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain a lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain an uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain a number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character';
  return '';
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.length > 50) return `${fieldName} cannot exceed 50 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} contains invalid characters`;
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return ''; // Phone is optional
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number';
  return '';
};

export const validateRequired = (value, fieldName = 'This field') => {
  if (!value) return `${fieldName} is required`;
  if (typeof value === 'string' && !value.trim()) return `${fieldName} is required`;
  return '';
};

export const validateMinLength = (value, min, fieldName = 'This field') => {
  if (value && value.length < min) return `${fieldName} must be at least ${min} characters`;
  return '';
};

export const validateMaxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) return `${fieldName} cannot exceed ${max} characters`;
  return '';
};

export const validateNumber = (value, fieldName = 'This field') => {
  if (!value && value !== 0) return `${fieldName} is required`;
  if (isNaN(value)) return `${fieldName} must be a number`;
  if (value < 0) return `${fieldName} cannot be negative`;
  return '';
};

export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return `${fieldName} is invalid`;
  return '';
};

export const validateBookingForm = (values) => {
  const errors = {};
  
  const checkInError = validateDate(values.checkIn, 'Check-in date');
  if (checkInError) errors.checkIn = checkInError;
  
  const checkOutError = validateDate(values.checkOut, 'Check-out date');
  if (checkOutError) errors.checkOut = checkOutError;
  
  if (!errors.checkIn && !errors.checkOut) {
    if (new Date(values.checkOut) <= new Date(values.checkIn)) {
      errors.checkOut = 'Check-out must be after check-in';
    }
    if (new Date(values.checkIn) < new Date()) {
      errors.checkIn = 'Check-in cannot be in the past';
    }
  }
  
  const adultsError = validateNumber(values.guests?.adults, 'Number of adults');
  if (adultsError) errors['guests.adults'] = adultsError;
  else if (values.guests?.adults < 1) errors['guests.adults'] = 'At least 1 adult required';
  
  return errors;
};

export const validateLoginForm = (values) => {
  const errors = {};
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validateRequired(values.password, 'Password');
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

export const validateSignupForm = (values) => {
  const errors = {};
  
  const firstNameError = validateName(values.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(values.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  
  if (values.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  const phoneError = validatePhone(values.phone);
  if (phoneError) errors.phone = phoneError;
  
  return errors;
};

export const validateContactForm = (values) => {
  const errors = {};
  
  const nameError = validateName(values.name, 'Name');
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  const messageError = validateMinLength(values.message, 10, 'Message');
  if (messageError) errors.message = messageError;
  
  return errors;
};

export const validateReviewForm = (values) => {
  const errors = {};
  
  if (!values.rating) errors.rating = 'Rating is required';
  
  const titleError = validateMinLength(values.title, 5, 'Title');
  if (titleError) errors.title = titleError;
  
  const contentError = validateMinLength(values.content, 10, 'Review');
  if (contentError) errors.content = contentError;
  
  return errors;
};
