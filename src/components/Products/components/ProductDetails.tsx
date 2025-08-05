import React, { useState } from 'react';
import { useProductsManager } from '@/hooks/useProductsManager';
import { ProductDialog } from '../ProductDialog';

interface Product {
  id?: string;
  name: string;
  description?: string;
  code: string;
  price?: number;
  cost_price?: number;
  stock_quantity?: number;
  min_stock?: number;
  max_stock?: number;
  unit?: string;
  barcode?: string;
  is_active?: boolean;
  weight?: number;
  dimensions?: string;
  supplier_id?: string;
}

export function ProductDetails() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { createProduct, updateProduct } = useProductsManager();

  const handleSubmitProduct = async (productData: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setIsDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  return (
    <div className="space-y-6">
      
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onSubmit={handleSubmitProduct}
      />
    </div>
  );
}
