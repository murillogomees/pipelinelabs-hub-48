import { describe, it, expect } from 'vitest';
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ } from './documentValidation';

describe('documentValidation', () => {
  describe('validateCPF', () => {
    it('validates correct CPF', () => {
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('111.444.777-35')).toBe(true);
    });

    it('rejects invalid CPF', () => {
      expect(validateCPF('11111111111')).toBe(false); // Same digits
      expect(validateCPF('123')).toBe(false); // Too short
      expect(validateCPF('12345678901')).toBe(false); // Invalid check digits
      expect(validateCPF('')).toBe(false); // Empty
    });

    it('rejects well-known invalid CPFs', () => {
      const invalidCPFs = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999',
      ];

      invalidCPFs.forEach(cpf => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });
  });

  describe('validateCNPJ', () => {
    it('validates correct CNPJ', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('rejects invalid CNPJ', () => {
      expect(validateCNPJ('11111111111111')).toBe(false); // Same digits
      expect(validateCNPJ('123')).toBe(false); // Too short
      expect(validateCNPJ('12345678901234')).toBe(false); // Invalid check digits
      expect(validateCNPJ('')).toBe(false); // Empty
    });
  });

  describe('formatCPF', () => {
    it('formats CPF correctly', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
      expect(formatCPF('111.444.777-35')).toBe('111.444.777-35'); // Already formatted
    });

    it('handles invalid input', () => {
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('')).toBe('');
    });
  });

  describe('formatCNPJ', () => {
    it('formats CNPJ correctly', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81'); // Already formatted
    });

    it('handles invalid input', () => {
      expect(formatCNPJ('123')).toBe('123');
      expect(formatCNPJ('')).toBe('');
    });
  });
});