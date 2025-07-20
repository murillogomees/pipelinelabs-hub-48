
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface Plan {
  id?: string;
  name: string;
  description: string;
  price: number;
  user_limit: number | null;
  trial_days: number;
  features: string[];
  is_custom: boolean;
  is_whitelabel: boolean;
  active: boolean;
}

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  onSave: (plan: Omit<Plan, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

export function PlanDialog({ open, onOpenChange, plan, onSave, isLoading }: PlanDialogProps) {
  const [formData, setFormData] = useState<Omit<Plan, 'id'>>({
    name: '',
    description: '',
    price: 0,
    user_limit: 1,
    trial_days: 0,
    features: [],
    is_custom: false,
    is_whitelabel: false,
    active: true,
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        user_limit: plan.user_limit,
        trial_days: plan.trial_days,
        features: Array.isArray(plan.features) ? plan.features : [],
        is_custom: plan.is_custom,
        is_whitelabel: plan.is_whitelabel,
        active: plan.active,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        user_limit: 1,
        trial_days: 0,
        features: [],
        is_custom: false,
        is_whitelabel: false,
        active: true,
      });
    }
  }, [plan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Básico, Profissional..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva as principais características do plano..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user_limit">Limite de Usuários</Label>
              <Input
                id="user_limit"
                type="number"
                min="1"
                value={formData.user_limit || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  user_limit: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="Deixe vazio para ilimitado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial_days">Dias de Teste</Label>
              <Input
                id="trial_days"
                type="number"
                min="0"
                value={formData.trial_days}
                onChange={(e) => setFormData(prev => ({ ...prev, trial_days: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Funcionalidades</Label>
            
            <div className="flex space-x-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Digite uma funcionalidade..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Plano Ativo</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_custom"
                checked={formData.is_custom}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_custom: checked }))}
              />
              <Label htmlFor="is_custom">Plano Customizado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_whitelabel"
                checked={formData.is_whitelabel}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_whitelabel: checked }))}
              />
              <Label htmlFor="is_whitelabel">White Label</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : plan ? 'Atualizar' : 'Criar Plano'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
