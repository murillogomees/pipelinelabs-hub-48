import CryptoJS from 'crypto-js';

// Certificado encryption/decryption utilities
export class CertificateEncryption {
  private static getEncryptionKey(): string {
    // This should use the CERT_ENCRYPTION_KEY from Supabase secrets
    // For now using a placeholder - will be replaced with proper secret
    return 'DEFAULT_CERT_KEY_REPLACE_WITH_SUPABASE_SECRET_256_BITS';
  }

  static async encryptCertificate(certificateData: ArrayBuffer, password: string): Promise<{
    encryptedCertificate: string;
    encryptedPassword: string;
    certificateIV: string;
    passwordIV: string;
  }> {
    const key = this.getEncryptionKey();
    
    // Generate random IVs for each encryption
    const certificateIV = CryptoJS.lib.WordArray.random(16).toString();
    const passwordIV = CryptoJS.lib.WordArray.random(16).toString();
    
    // Convert ArrayBuffer to base64 for encryption
    const certificateBase64 = btoa(String.fromCharCode(...new Uint8Array(certificateData)));
    
    // Encrypt certificate data
    const encryptedCertificate = CryptoJS.AES.encrypt(certificateBase64, key, {
      iv: CryptoJS.enc.Hex.parse(certificateIV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    
    // Encrypt password
    const encryptedPassword = CryptoJS.AES.encrypt(password, key, {
      iv: CryptoJS.enc.Hex.parse(passwordIV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
    
    return {
      encryptedCertificate,
      encryptedPassword,
      certificateIV,
      passwordIV
    };
  }

  static async decryptCertificate(
    encryptedCertificate: string,
    encryptedPassword: string,
    certificateIV: string,
    passwordIV: string
  ): Promise<{ certificateData: ArrayBuffer; password: string }> {
    const key = this.getEncryptionKey();
    
    try {
      // Decrypt certificate
      const decryptedCertificateBase64 = CryptoJS.AES.decrypt(encryptedCertificate, key, {
        iv: CryptoJS.enc.Hex.parse(certificateIV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
      
      // Decrypt password
      const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, key, {
        iv: CryptoJS.enc.Hex.parse(passwordIV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }).toString(CryptoJS.enc.Utf8);
      
      // Convert base64 back to ArrayBuffer
      const binaryString = atob(decryptedCertificateBase64);
      const certificateData = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(certificateData);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      return {
        certificateData,
        password: decryptedPassword
      };
    } catch (error) {
      throw new Error('Falha ao descriptografar certificado. Verifique a integridade dos dados.');
    }
  }

  static validateCertificateFile(file: File): boolean {
    const validExtensions = ['.pfx', '.p12'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      throw new Error('Apenas arquivos .pfx ou .p12 são aceitos');
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo 10MB');
    }
    
    return true;
  }

  static async extractCertificateMetadata(certificateData: ArrayBuffer, password: string): Promise<{
    commonName: string;
    expirationDate: Date;
    fingerprint: string;
    issuer: string;
  }> {
    // Simplified implementation - should be replaced with actual certificate parsing
    const mockExpirationDate = new Date();
    mockExpirationDate.setFullYear(mockExpirationDate.getFullYear() + 1);
    
    return {
      commonName: 'Certificado A1',
      expirationDate: mockExpirationDate,
      fingerprint: 'SHA256-FINGERPRINT',
      issuer: 'AC-Certificadora'
    };
  }

  static generateFingerprint(certificateData: ArrayBuffer): string {
    // Generate SHA-256 fingerprint
    const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(certificateData));
    return hash.toString(CryptoJS.enc.Hex).toUpperCase();
  }
}