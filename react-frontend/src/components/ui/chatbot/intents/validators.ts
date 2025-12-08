// src/components/ui/chatbot/validators.ts

export const validateAge = (val: string) => {
  const num = parseInt(val);
  return !isNaN(num) && num >= 1 && num <= 119;
};

export const validateHeight = (val: string) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 30 && num <= 300;
};

export const validateWeight = (val: string) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 2 && num <= 600;
};

export const validators: any = {
  age: validateAge,
  gender: (val: string) =>
    ["male", "female", "trans"].includes(val.toLowerCase()),
  height: validateHeight,
  weight: validateWeight,
  blood_group: (val: string) =>
    ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(
      val.toUpperCase()
    ),
  address: (val: string) => val.trim().length > 2,
  symptoms: (val: string) => val.trim().length >= 3,
};
