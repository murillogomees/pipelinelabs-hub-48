import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { WarehouseFormData, Warehouse } from "@/hooks/useWarehouses";

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: WarehouseFormData) => void;
  initialData?: Warehouse;
}

export function WarehouseDialog({ open, onOpenChange, onSubmit, initialData }: WarehouseDialogProps) {
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    description: '',
    address: '',
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        address: initialData.address || '',
        is_active: initialData.is_active,
        is_default: initialData.is_default,
      });
    } else if (!open) {
      setFormData({
        name: '',
        description: '',
        address: '',
        is_active: true,
        is_default: false,
      });
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Depósito' : 'Novo Depósito'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do depósito"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do depósito"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Endereço do depósito"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Ativo</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
            />
            <Label htmlFor="is_default">Depósito Padrão</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Atualizar' : 'Criar'} Depósito
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}