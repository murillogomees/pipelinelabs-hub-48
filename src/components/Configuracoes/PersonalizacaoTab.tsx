import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Palette, Image, Monitor } from 'lucide-react';

export function PersonalizacaoTab() {
  const [settings, setSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    logo: '',
    favicon: '',
    customCSS: '',
    darkMode: false,
    compactMode: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Settings submitted:', settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg"><Palette className="w-4 h-4 mr-2 inline-block" /> Personalização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <Input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <Input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleChange}
              />
            </div>
          </div>

          <Separator />

          {/* Imagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input
                type="text"
                id="logo"
                name="logo"
                placeholder="URL do Logo"
                value={settings.logo}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="favicon">Favicon</Label>
              <Input
                type="text"
                id="favicon"
                name="favicon"
                placeholder="URL do Favicon"
                value={settings.favicon}
                onChange={handleChange}
              />
            </div>
          </div>

          <Separator />

          {/* CSS Customizado */}
          <div>
            <Label htmlFor="customCSS">CSS Customizado</Label>
            <Input
              type="text"
              id="customCSS"
              name="customCSS"
              placeholder="Adicione seu CSS customizado"
              value={settings.customCSS}
              onChange={handleChange}
            />
          </div>

          <Separator />

          {/* Modo Dark e Compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode">
                <Monitor className="w-4 h-4 mr-2 inline-block" />
                Modo Dark
              </Label>
              <Switch
                id="darkMode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSwitchChange('darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="compactMode">
                <Image className="w-4 h-4 mr-2 inline-block" />
                Modo Compacto
              </Label>
              <Switch
                id="compactMode"
                checked={settings.compactMode}
                onCheckedChange={(checked) => handleSwitchChange('compactMode', checked)}
              />
            </div>
          </div>

          <Button type="submit">Salvar Alterações</Button>
        </form>
      </CardContent>
    </Card>
  );
}
