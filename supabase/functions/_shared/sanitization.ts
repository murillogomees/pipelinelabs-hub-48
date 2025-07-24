// Edge function sanitization utilities
// This is a self-contained version for edge functions

export function sanitizeRequestData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeUserInput(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeRequestData(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizeUserInput(key);
      sanitized[sanitizedKey] = sanitizeRequestData(value);
    }
    return sanitized;
  }

  return data;
}

export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    // Remove potential XSS patterns
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    
    // Remove javascript: and data: protocols
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    
    // Remove on* event handlers
    .replace(/\son\w+\s*=/gi, ' ')
    
    // Clean up multiple spaces and trim
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeHtmlContent(content: string, allowBasicTags: boolean = true): string {
  if (typeof content !== 'string') {
    return content;
  }

  if (!allowBasicTags) {
    // Strip all HTML tags
    return content.replace(/<[^>]*>/g, '');
  }

  // Allow only safe HTML tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const tagPattern = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\s*\/?>)[^>]*>`, 'gi');
  
  return content
    .replace(tagPattern, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/\son\w+\s*=/gi, ' ');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}