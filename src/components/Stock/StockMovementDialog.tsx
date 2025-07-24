import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useState, useEffect } from "react";
import { useProducts } from "@/components/Products/hooks/useProducts";
import { useWarehouses } from "@/hooks/useWarehouses";
import { StockMovementFormData } from "@/hooks/useStockMovements";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StockMovementFormData) => void;
}

const movementTypes = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'venda', label: 'Venda' },
  { value: 'compra', label: 'Compra' },
  { value: 'producao', label: 'Produção' },
];

export function StockMovementDialog({ open, onOpenChange, onSubmit }: StockMovementDialogProps) {
  const { data: products } = useProducts();
  const { warehouses } = useWarehouses();

  const [formData, setFormData] = useState<StockMovementFormData>({
    product_id: '',
    movement_type: '',
    quantity: 0,
    unit_cost: undefined,
    reason: '',
    reference_type: '',
    reference_id: '',
    warehouse_from: '',
    warehouse_to: '',
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        product_id: '',
        movement_type: '',
        quantity: 0,
        unit_cost: undefined,
        reason: '',
        reference_type: '',
        reference_id: '',
        warehouse_from: '',
        warehouse_to: '',
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Movimentação de Estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product">Produto *</Label>
              <SearchableSelect
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                placeholder="Selecione um produto"
                staticOptions={products?.map(product => ({
                  value: product.id,
                  label: `${product.name} - ${product.code}`
                })) || []}
              />
            </div>
            <div>
              <Label htmlFor="movement_type">Tipo de Movimentação *</Label>
              <SearchableSelect
                value={formData.movement_type}
                onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
                placeholder="Selecione o tipo"
                staticOptions={movementTypes}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Digite a quantidade"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_cost">Custo Unitário</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost || ''}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || undefined })}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          {formData.movement_type === 'transferencia' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouse_from">Depósito de Origem</Label>
                <SearchableSelect
                  value={formData.warehouse_from || ''}
                  onValueChange={(value) => setFormData({ ...formData, warehouse_from: value })}
                  placeholder="Selecione o depósito"
                   staticOptions={(warehouses || []).filter((w: any) => w && w.name).map(warehouse => ({
                    value: (warehouse as any).name,
                    label: (warehouse as any).name
                  })) || []}
                />
              </div>
              <div>
                <Label htmlFor="warehouse_to">Depósito de Destino</Label>
                <SearchableSelect
                  value={formData.warehouse_to || ''}
                  onValueChange={(value) => setFormData({ ...formData, warehouse_to: value })}
                  placeholder="Selecione o depósito"
                  staticOptions={(warehouses || []).filter((w: any) => w && w.name).map(warehouse => ({
                    value: (warehouse as any).name,
                    label: (warehouse as any).name
                  })) || []}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reference_type">Tipo de Referência</Label>
              <Input
                id="reference_type"
                value={formData.reference_type || ''}
                onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
                placeholder="Ex: venda, compra, ajuste"
              />
            </div>
            <div>
              <Label htmlFor="reference_id">ID de Referência</Label>
              <Input
                id="reference_id"
                value={formData.reference_id || ''}
                onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                placeholder="ID do documento relacionado"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Descreva o motivo da movimentação"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Registrar Movimentação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}