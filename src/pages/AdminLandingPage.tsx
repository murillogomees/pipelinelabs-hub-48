import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Loader2, Save, Eye, Settings } from 'lucide-react';

export default function AdminLandingPage() {
  const { content, settings, loading, updateContent, updateSetting, getContentBySection, getSettingValue } = useLandingPageContent();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const sections = [
    { key: 'hero', label: 'Seção Hero', description: 'Banner principal da página' },
    { key: 'pain_section', label: 'Seção de Problemas', description: 'Dores e problemas dos clientes' },
    { key: 'features', label: 'Funcionalidades', description: 'Recursos e benefícios do sistema' },
    { key: 'pricing', label: 'Preços', description: 'Tabela de preços e planos' },
  ];

  const settingsConfig = [
    { key: 'company_name', label: 'Nome da Empresa', type: 'text' },
    { key: 'primary_color', label: 'Cor Primária', type: 'color' },
    { key: 'secondary_color', label: 'Cor Secundária', type: 'color' },
    { key: 'logo_url', label: 'URL do Logo', type: 'url' },
    { key: 'contact_email', label: 'Email de Contato', type: 'email' },
    { key: 'contact_phone', label: 'Telefone de Contato', type: 'tel' },
  ];

  const handleEditSection = (sectionKey: string) => {
    const sectionData = getContentBySection(sectionKey);
    if (sectionData) {
      setFormData({
        title: sectionData.title || '',
        subtitle: sectionData.subtitle || '',
        description: sectionData.description || '',
        image_url: sectionData.image_url || '',
        link_url: sectionData.link_url || '',
        button_text: sectionData.button_text || '',
        content_data: JSON.stringify(sectionData.content_data, null, 2),
        is_active: sectionData.is_active,
      });
      setEditingSection(sectionKey);
    }
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;

    const sectionData = getContentBySection(editingSection);
    if (!sectionData) return;

    try {
      const contentData = formData.content_data ? JSON.parse(formData.content_data) : {};
      
      await updateContent(sectionData.id, {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        image_url: formData.image_url,
        link_url: formData.link_url,
        button_text: formData.button_text,
        content_data: contentData,
        is_active: formData.is_active,
      });

      setEditingSection(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleSettingChange = async (settingKey: string, value: string) => {
    await updateSetting(settingKey, value);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Landing Page</h1>
            <p className="text-muted-foreground">Configure o conteúdo e aparência da landing page</p>
          </div>
          <Button variant="outline" onClick={() => window.open('/landing', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Visualizar Landing Page
          </Button>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6">
              {sections.map((section) => {
                const sectionData = getContentBySection(section.key);
                const isEditing = editingSection === section.key;

                return (
                  <Card key={section.key}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{section.label}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={sectionData?.is_active ?? true}
                            onCheckedChange={(checked) => {
                              if (sectionData) {
                                updateContent(sectionData.id, { is_active: checked });
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSection(section.key)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {isEditing && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${section.key}`}>Título</Label>
                            <Input
                              id={`title-${section.key}`}
                              value={formData.title || ''}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`subtitle-${section.key}`}>Subtítulo</Label>
                            <Input
                              id={`subtitle-${section.key}`}
                              value={formData.subtitle || ''}
                              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`description-${section.key}`}>Descrição</Label>
                          <Textarea
                            id={`description-${section.key}`}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`image-${section.key}`}>URL da Imagem</Label>
                            <Input
                              id={`image-${section.key}`}
                              value={formData.image_url || ''}
                              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`button-${section.key}`}>Texto do Botão</Label>
                            <Input
                              id={`button-${section.key}`}
                              value={formData.button_text || ''}
                              onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`content-${section.key}`}>Dados Adicionais (JSON)</Label>
                          <Textarea
                            id={`content-${section.key}`}
                            value={formData.content_data || ''}
                            onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
                            rows={8}
                            className="font-mono text-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleSaveSection}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={() => setEditingSection(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Configure cores, logos e informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsConfig.map((setting) => (
                  <div key={setting.key}>
                    <Label htmlFor={setting.key}>{setting.label}</Label>
                    <Input
                      id={setting.key}
                      type={setting.type}
                      value={getSettingValue(setting.key)}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className={setting.type === 'color' ? 'w-20 h-10' : ''}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}