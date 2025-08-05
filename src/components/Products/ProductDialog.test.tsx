
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import { ProductDialog } from './ProductDialog';
import { mockProduct } from '@/test/utils';

// Mock the products hook
vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    isCreating: false,
    isUpdating: false,
  }),
}));

describe('ProductDialog', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    product: null,
    onSubmit: mockOnSubmit,
  };

  it('renders create product dialog', () => {
    render(<ProductDialog {...defaultProps} />);
    
    expect(screen.getByText(/novo produto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar/i })).toBeInTheDocument();
  });

  it('renders edit product dialog when product is provided', () => {
    render(<ProductDialog {...defaultProps} product={mockProduct} />);
    
    expect(screen.getByText(/editar produto/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ProductDialog {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /criar/i });
    await user.click(saveButton);
    
    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ProductDialog {...defaultProps} />);
    
    // Fill form
    await user.type(screen.getByPlaceholderText(/nome do produto/i), 'New Product');
    await user.type(screen.getByPlaceholderText(/código/i), 'PROD001');
    
    const saveButton = screen.getByRole('button', { name: /criar/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          code: 'PROD001',
        })
      );
    });
  });
});
