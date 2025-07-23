import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStripeConfig } from "@/hooks/useStripeConfig";
import { Loader2, TestTube } from "lucide-react";

interface StripeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StripeConfigDialog({ open, onOpenChange }: StripeConfigDialogProps) {
  const { config, saveConfig, testConnection, isSaving, isTesting } = useStripeConfig();
  
  const [formData, setFormData] = useState({
    stripe_publishable_key: config?.stripe_publishable_key || "",
    stripe_secret_key_encrypted: "",
    stripe_webhook_secret_encrypted: config?.stripe_webhook_secret_encrypted || "",
    default_currency: config?.default_currency || "brl",
    test_mode: config?.test_mode ?? true,
  });

  const handleSave = async () => {
    try {
      await saveConfig(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving config:", error);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.stripe_secret_key_encrypted) {
      return;
    }
    
    try {
      await testConnection(formData.stripe_secret_key_encrypted);
    } catch (error) {
      console.error("Error testing connection:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuração do Stripe</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Credenciais da API</CardTitle>
              <CardDescription>
                Configure suas chaves de API do Stripe. Todas as chaves são criptografadas antes de serem armazenadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="publishable_key">Publishable Key</Label>
                <Input
                  id="publishable_key"
                  placeholder="pk_test_..."
                  value={formData.stripe_publishable_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="secret_key">Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="secret_key"
                    type="password"
                    placeholder="sk_test_..."
                    value={formData.stripe_secret_key_encrypted}
                    onChange={(e) => setFormData(prev => ({ ...prev, stripe_secret_key_encrypted: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={!formData.stripe_secret_key_encrypted || isTesting}
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="webhook_secret">Webhook Secret (Opcional)</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  placeholder="whsec_..."
                  value={formData.stripe_webhook_secret_encrypted}
                  onChange={(e) => setFormData(prev => ({ ...prev, stripe_webhook_secret_encrypted: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currency">Moeda Padrão</Label>
                <Select
                  value={formData.default_currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, default_currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brl">Real Brasileiro (BRL)</SelectItem>
                    <SelectItem value="usd">Dólar Americano (USD)</SelectItem>
                    <SelectItem value="eur">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="test_mode">Modo de Teste</Label>
                  <p className="text-sm text-muted-foreground">
                    Use as chaves de teste do Stripe para desenvolvimento
                  </p>
                </div>
                <Switch
                  id="test_mode"
                  checked={formData.test_mode}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, test_mode: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configuração"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}