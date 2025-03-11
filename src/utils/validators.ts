export const validatePassword = (password: string) => {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasValidLength = password.length >= 8;

  return hasLetter && hasNumber && hasSpecialChar && hasValidLength;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
  return emailRegex.test(email);
};

export const isEmpty = (value?: String | null | never[]) =>
  value === '' || value === null || value === undefined || value?.length === 0;
