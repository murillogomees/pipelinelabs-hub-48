import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

// XSS Protection configuration
const xssOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target'],
    'table': ['class'],
    'th': ['colspan', 'rowspan'],
    'td': ['colspan', 'rowspan']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'],
  selfClosing: ['br'],
  nonTextTags: ['style', 'script', 'textarea', 'option']
};

// Strict XSS options for user input
const strictXssOptions = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u'],
  allowedAttributes: {},
  allowedSchemes: [],
  selfClosing: ['br']
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtmlContent(content: string, strict: boolean = false): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  const options = strict ? strictXssOptions : xssOptions;
  return sanitizeHtml(content, options);
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags completely
  let sanitized = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {}
  });
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
}

/**
 * Sanitize and validate email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeUserInput(email.toLowerCase());
  return validator.isEmail(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeUserInput(url);
  
  // Validate URL format
  if (!validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true
  })) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Validate phone number length (Brazilian format)
  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    return '';
  }
  
  return digitsOnly;
}

/**
 * Sanitize document (CPF/CNPJ)
 */
export function sanitizeDocument(document: string): string {
  if (!document || typeof document !== 'string') {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = document.replace(/\D/g, '');
  
  // Validate document length
  if (digitsOnly.length !== 11 && digitsOnly.length !== 14) {
    return '';
  }
  
  return digitsOnly;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  
  // Remove directory traversal attempts
  let sanitized = filename.replace(/[\/\\]/g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.substring(0, 255 - ext.length - 1);
    sanitized = `${name}.${ext}`;
  }
  
  return sanitized;
}

/**
 * Sanitize JSON input to prevent injection
 */
export function sanitizeJsonInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeUserInput(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeJsonInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(input)) {
      // Sanitize keys
      const sanitizedKey = sanitizeUserInput(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeJsonInput(value);
      }
    }
    
    return sanitized;
  }
  
  return input;
}

/**
 * Validate and sanitize SQL-like inputs (for search queries)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // Remove SQL injection attempts
  let sanitized = query.replace(/[';\"\\]/g, '');
  
  // Remove SQL keywords
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'UNION', 'OR', 'AND', 'WHERE', 'FROM', 'JOIN', 'HAVING', 'GROUP',
    'ORDER', 'BY', 'LIMIT', 'OFFSET', 'EXEC', 'EXECUTE', 'DECLARE'
  ];
  
  const regex = new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'gi');
  sanitized = sanitized.replace(regex, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

/**
 * Escape HTML for safe display
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize rich text content (for editors)
 */
export function sanitizeRichText(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return sanitizeHtml(content, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ol', 'ul', 'li', 'a',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
      'p': ['style'],
      'span': ['style']
    },
    allowedStyles: {
      '*': {
        'color': [/^#[0-9A-F]{6}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        'background-color': [/^#[0-9A-F]{6}$/i, /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/],
        'font-weight': [/^(bold|normal)$/],
        'font-style': [/^(italic|normal)$/],
        'text-decoration': [/^(underline|none)$/]
      }
    }
  });
}

/**
 * Rate limiting key sanitization
 */
export function sanitizeRateLimitKey(key: string): string {
  if (!key || typeof key !== 'string') {
    return 'unknown';
  }
  
  // Remove any characters that could cause issues
  return key.replace(/[^a-zA-Z0-9:._-]/g, '').substring(0, 100);
}

/**
 * Comprehensive input sanitization middleware
 */
export function sanitizeRequestData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return sanitizeUserInput(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeRequestData);
  }
  
  if (typeof data === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeUserInput(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeRequestData(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

export const sanitization = {
  sanitizeHtmlContent,
  sanitizeUserInput,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  sanitizeDocument,
  sanitizeFilename,
  sanitizeJsonInput,
  sanitizeSearchQuery,
  escapeHtml,
  sanitizeRichText,
  sanitizeRateLimitKey,
  sanitizeRequestData
};