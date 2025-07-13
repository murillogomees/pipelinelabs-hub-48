/**
 * Valida e formata documentos (CPF/CNPJ)
 */

export const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits
    .substring(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

export const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits
    .substring(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2');
};

export const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;

  return true;
};

export const validateCNPJ = (cnpj: string): boolean => {
  const digits = cnpj.replace(/\D/g, '');
  
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  let weight = 2;
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(digits[12])) return false;
  
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(digits[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return digit2 === parseInt(digits[13]);
};

export const cleanDocument = (document: string): string => {
  return document.replace(/\D/g, '');
};

export const getDocumentType = (document: string): 'cpf' | 'cnpj' | 'invalid' => {
  const cleaned = cleanDocument(document);
  if (cleaned.length === 11) return 'cpf';
  if (cleaned.length === 14) return 'cnpj';
  return 'invalid';
};