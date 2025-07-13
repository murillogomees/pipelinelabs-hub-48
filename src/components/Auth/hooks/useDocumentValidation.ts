import { validateCPF, validateCNPJ, cleanDocument, getDocumentType, formatCPF, formatCNPJ } from '@/utils/documentValidation';

export function useDocumentValidation() {
  const handleDocumentChange = (
    value: string,
    setDocument: (doc: string) => void,
    setDocumentType: (type: 'cpf' | 'cnpj') => void
  ) => {
    const docType = getDocumentType(value);
    if (docType !== 'invalid') {
      setDocumentType(docType);
    }
    
    if (docType === 'cpf') {
      setDocument(formatCPF(value));
    } else if (docType === 'cnpj') {
      setDocument(formatCNPJ(value));
    } else {
      setDocument(value);
    }
  };

  const validateDocument = (document: string, documentType: 'cpf' | 'cnpj'): string | null => {
    const cleaned = cleanDocument(document);
    
    if (documentType === 'cpf') {
      if (!validateCPF(cleaned)) {
        return 'CPF inválido';
      }
    } else if (documentType === 'cnpj') {
      if (!validateCNPJ(cleaned)) {
        return 'CNPJ inválido';
      }
    }
    
    return null;
  };

  return {
    handleDocumentChange,
    validateDocument,
  };
}