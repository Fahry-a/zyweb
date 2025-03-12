export const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // Minimal 8 karakter, setidaknya satu huruf dan satu angka
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(password);
};

export const validateUserData = (userData, isCreating = false) => {
  const errors = {};

  if (!userData.name || userData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  if (!userData.email || !validateEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (isCreating && (!userData.password || !validatePassword(userData.password))) {
    errors.password = 'Password must be at least 8 characters long and contain at least one letter and one number';
  }

  if (!userData.role || !['user', 'premium', 'admin'].includes(userData.role)) {
    errors.role = 'Please select a valid role';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};