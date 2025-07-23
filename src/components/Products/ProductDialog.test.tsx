import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/utils';
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
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    product: null,
  };

  it('renders create product dialog', () => {
    render(<ProductDialog {...defaultProps} />);
    
    expect(screen.getByText(/cadastrar produto/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('renders edit product dialog when product is provided', () => {
    render(<ProductDialog {...defaultProps} product={mockProduct} />);
    
    expect(screen.getByText(/editar produto/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ProductDialog {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockCreate = vi.fn();
    
    vi.mocked(require('@/hooks/useProducts').useProducts).mockReturnValue({
      createProduct: mockCreate,
      updateProduct: vi.fn(),
      isCreating: false,
      isUpdating: false,
    });

    render(<ProductDialog {...defaultProps} />);
    
    // Fill form
    await user.type(screen.getByPlaceholderText(/nome do produto/i), 'New Product');
    await user.type(screen.getByPlaceholderText(/preço/i), '149.99');
    await user.type(screen.getByPlaceholderText(/quantidade/i), '5');
    
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          price: 149.99,
          stock_quantity: 5,
        })
      );
    });
  });
});