// Common validation utilities
export const isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

export const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

export const isValidDateRange = (startDate, endDate) => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }
  return new Date(endDate) > new Date(startDate);
};

export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[&]/g, '&amp;')
    .replace(/["]/g, '&quot;')
    .replace(/[']/g, '&#x27;')
    .replace(/[/]/g, '&#x2F;');
};

export const validatePagination = (page, limit) => {
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;
  
  return { page, limit };
};