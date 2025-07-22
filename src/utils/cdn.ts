import { supabase } from '@/integrations/supabase/client';

// CDN Configuration
const DEFAULT_CDN_BASE = 'https://cdn.pipelinelabs.app';
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.svg', '.mp4', '.gif'];

/**
 * Build CDN URL for an asset
 */
export function buildCDNUrl(
  assetPath: string, 
  companyId: string, 
  cdnBase?: string
): string {
  const baseUrl = cdnBase || DEFAULT_CDN_BASE;
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  
  return `${baseUrl}/company/${companyId}/${cleanPath}`;
}

/**
 * Get asset path for specific category
 */
export function getAssetPath(category: string, fileName: string): string {
  const validCategories = ['produtos', 'notas', 'uploads', 'logos', 'documentos'];
  const safeCategory = validCategories.includes(category) ? category : 'uploads';
  
  return `${safeCategory}/${fileName}`;
}

/**
 * Upload file to Supabase Storage with CDN-friendly structure
 */
export async function uploadToCDN(
  file: File,
  category: string,
  companyId: string,
  customFileName?: string
): Promise<{ url: string; path: string }> {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !SUPPORTED_FORMATS.some(format => format.includes(fileExt))) {
      throw new Error('Formato de arquivo não suportado');
    }

    const fileName = customFileName || `${Date.now()}.${fileExt}`;
    const assetPath = getAssetPath(category, fileName);
    const fullPath = `${companyId}/${assetPath}`;

    const { data, error } = await supabase.storage
      .from('company-assets')
      .upload(fullPath, file, {
        cacheControl: getCacheHeaders(fileExt),
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('company-assets')
      .getPublicUrl(fullPath);

    return {
      url: publicUrl,
      path: assetPath
    };
  } catch (error) {
    console.error('CDN upload failed:', error);
    throw error;
  }
}

/**
 * Delete file from CDN
 */
export async function deleteFromCDN(
  assetPath: string,
  companyId: string
): Promise<boolean> {
  try {
    const fullPath = `${companyId}/${assetPath}`;
    
    const { error } = await supabase.storage
      .from('company-assets')
      .remove([fullPath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('CDN delete failed:', error);
    return false;
  }
}

/**
 * Get cache headers based on file type
 */
export function getCacheHeaders(fileExtension: string): string {
  const ext = fileExtension.toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
    return '86400'; // 24 hours for images
  } else if (['.mp4', '.webm'].includes(ext)) {
    return '604800'; // 7 days for videos
  } else if (['.pdf', '.doc', '.docx'].includes(ext)) {
    return '3600'; // 1 hour for documents
  }
  
  return '3600'; // Default 1 hour
}

/**
 * Validate CDN domain
 */
export function validateCDNDomain(domain: string): boolean {
  try {
    const url = new URL(domain);
    return url.protocol === 'https:' && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Generate fallback URL if CDN fails
 */
export function getFallbackUrl(originalUrl: string): string {
  // Extract the path from CDN URL and use Supabase storage directly
  const pathMatch = originalUrl.match(/\/company\/([^\/]+)\/(.+)$/);
  if (pathMatch) {
    const [, companyId, assetPath] = pathMatch;
    const { data: { publicUrl } } = supabase.storage
      .from('company-assets')
      .getPublicUrl(`${companyId}/${assetPath}`);
    return publicUrl;
  }
  return originalUrl;
}

/**
 * Set CDN cache headers for responses
 */
export function setCDNHeaders(fileExtension: string): Record<string, string> {
  const cacheControl = getCacheHeaders(fileExtension);
  
  return {
    'Cache-Control': `public, max-age=${cacheControl}`,
    'Content-Type': getContentType(fileExtension),
    'ETag': generateETag(),
    'Vary': 'Accept-Encoding'
  };
}

/**
 * Get content type based on file extension
 */
function getContentType(fileExtension: string): string {
  const ext = fileExtension.toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };
  
  return types[ext] || 'application/octet-stream';
}

/**
 * Generate simple ETag for caching
 */
function generateETag(): string {
  return `"${Date.now().toString(36)}"`;
}