import { z } from 'zod';
import { sanitizeRequestData } from './sanitization';

// Validation result type
export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Security validation options
export interface SecurityOptions {
  sanitizeInput?: boolean;
  maxPayloadSize?: number;
  allowedContentTypes?: string[];
  rateLimitBypass?: boolean;
}

/**
 * Validate request data against a Zod schema
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options: SecurityOptions = {}
): ValidationResult<T> {
  const {
    sanitizeInput = true,
    maxPayloadSize = 1024 * 1024, // 1MB default
    allowedContentTypes = ['application/json', 'multipart/form-data']
  } = options;

  try {
    // Check payload size
    const dataSize = JSON.stringify(data).length;
    if (dataSize > maxPayloadSize) {
      return {
        success: false,
        error: 'Payload muito grande'
      };
    }

    // Sanitize input if enabled
    const processedData = sanitizeInput ? sanitizeRequestData(data) : data;

    // Validate with Zod schema
    const result = schema.safeParse(processedData);

    if (!result.success) {
      // Format Zod errors
      const errors: Record<string, string[]> = {};
      
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      });

      return {
        success: false,
        error: 'Dados inválidos',
        errors
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro na validação dos dados'
    };
  }
}

/**
 * Create validation middleware for forms
 */
export function createValidationMiddleware<T>(
  schema: z.ZodSchema<T>,
  options: SecurityOptions = {}
) {
  return (data: unknown): ValidationResult<T> => {
    return validateRequest(schema, data, options);
  };
}

/**
 * Validate form data with comprehensive error handling
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  formData: FormData | Record<string, any>,
  options: SecurityOptions = {}
): ValidationResult<T> {
  try {
    let data: Record<string, any> = {};

    // Convert FormData to object if needed
    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          data[key] = {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified
          };
        } else {
          data[key] = value;
        }
      }
    } else {
      data = formData;
    }

    return validateRequest(schema, data, options);
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro ao processar formulário'
    };
  }
}

/**
 * Validate API request with headers and body
 */
export function validateApiRequest<T>(
  schema: z.ZodSchema<T>,
  request: {
    headers?: Record<string, string>;
    body?: any;
    method?: string;
    url?: string;
  },
  options: SecurityOptions = {}
): ValidationResult<T> {
  const { allowedContentTypes = ['application/json'] } = options;

  try {
    // Validate content type
    const contentType = request.headers?.['content-type'] || '';
    const isValidContentType = allowedContentTypes.some(type => 
      contentType.includes(type)
    );

    if (!isValidContentType && request.body) {
      return {
        success: false,
        error: 'Tipo de conteúdo não permitido'
      };
    }

    // Validate method if specified
    const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    if (request.method && !allowedMethods.includes(request.method)) {
      return {
        success: false,
        error: 'Método HTTP não permitido'
      };
    }

    return validateRequest(schema, request.body, options);
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro na validação da requisição'
    };
  }
}

/**
 * Batch validation for multiple schemas
 */
export function validateBatch<T extends Record<string, any>>(
  schemas: { [K in keyof T]: z.ZodSchema<T[K]> },
  data: { [K in keyof T]: unknown },
  options: SecurityOptions = {}
): ValidationResult<T> {
  const results: Partial<T> = {};
  const errors: Record<string, string[]> = {};
  let hasErrors = false;

  for (const [key, schema] of Object.entries(schemas)) {
    const result = validateRequest(schema, data[key], options);
    
    if (result.success) {
      results[key as keyof T] = result.data as T[keyof T];
    } else {
      hasErrors = true;
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, fieldErrors]) => {
          const fullPath = `${key}.${field}`;
          errors[fullPath] = fieldErrors;
        });
      } else if (result.error) {
        errors[key] = [result.error];
      }
    }
  }

  if (hasErrors) {
    return {
      success: false,
      error: 'Erro na validação dos dados',
      errors
    };
  }

  return {
    success: true,
    data: results as T
  };
}

/**
 * File upload validation
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): ValidationResult<File> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf']
  } = options;

  try {
    // Check file size
    if (file.size > maxSize) {
      return {
        success: false,
        error: `Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / (1024 * 1024))}MB`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      };
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        success: false,
        error: `Extensão não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`
      };
    }

    // Check filename
    if (file.name.length > 255) {
      return {
        success: false,
        error: 'Nome do arquivo muito longo'
      };
    }

    return {
      success: true,
      data: file
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro na validação do arquivo'
    };
  }
}

/**
 * Error formatter for user-friendly messages
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages: string[] = [];
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    const fieldName = field.split('.').pop() || field;
    messages.push(`${fieldName}: ${fieldErrors.join(', ')}`);
  }
  
  return messages.join('\n');
}

/**
 * Safe error message (removes sensitive information)
 */
export function createSafeErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Remove sensitive information from error messages
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /secret/gi,
      /key/gi,
      /credential/gi,
      /database/gi,
      /connection/gi,
      /host/gi,
      /port/gi
    ];
    
    let message = error.message;
    sensitivePatterns.forEach(pattern => {
      message = message.replace(pattern, '[REDACTED]');
    });
    
    return message;
  }
  
  return 'Erro interno do servidor';
}

export const validationMiddleware = {
  validateRequest,
  createValidationMiddleware,
  validateFormData,
  validateApiRequest,
  validateBatch,
  validateFileUpload,
  formatValidationErrors,
  createSafeErrorMessage
};