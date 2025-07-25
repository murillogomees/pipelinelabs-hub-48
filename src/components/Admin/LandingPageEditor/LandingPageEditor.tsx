import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  Layout, 
  Palette,
  Edit2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useLandingPageContent } from '@/hooks/useLandingPageContent';

export function LandingPageEditor() {
  const { sections, isLoading, updateSection, isUpdating, getSection } = useLandingPageContent();
  const [activeTab, setActiveTab] = useState("hero");
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  const handleSectionUpdate = (sectionId: string, updates: any) => {
    updateSection({ id: sectionId, updates });
    setEditingSection(null);
  };

  const renderSectionEditor = (sectionKey: string, sectionTitle: string) => {
    const section = getSection(sectionKey);
    
    if (!section) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{sectionTitle}</CardTitle>
            <CardDescription>Seção não encontrada</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    const isEditing = editingSection === section.id;

    return (
      <Card key={section.id}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {sectionTitle}
                <Badge variant={section.is_active ? "default" : "secondary"}>
                  {section.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </CardTitle>
              <CardDescription>
                Edite o conteúdo da seção {sectionKey}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSection(isEditing ? null : section.id)}
              >
                <Edit2 className="h-4 w-4" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {isEditing && (
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`title-${section.id}`}>Título</Label>
              <Input
                id={`title-${section.id}`}
                defaultValue={section.title || ''}
                onBlur={(e) => {
                  if (e.target.value !== section.title) {
                    handleSectionUpdate(section.id, { title: e.target.value });
                  }
                }}
              />
            </div>
            
            <div>
              <Label htmlFor={`subtitle-${section.id}`}>Subtítulo</Label>
              <Input
                id={`subtitle-${section.id}`}
                defaultValue={section.subtitle || ''}
                onBlur={(e) => {
                  if (e.target.value !== section.subtitle) {
                    handleSectionUpdate(section.id, { subtitle: e.target.value });
                  }
                }}
              />
            </div>
            
            <div>
              <Label htmlFor={`description-${section.id}`}>Descrição</Label>
              <Textarea
                id={`description-${section.id}`}
                defaultValue={section.description || ''}
                rows={3}
                onBlur={(e) => {
                  if (e.target.value !== section.description) {
                    handleSectionUpdate(section.id, { description: e.target.value });
                  }
                }}
              />
            </div>

            {/* Content Data Editor */}
            <div>
              <Label htmlFor={`content-data-${section.id}`}>Dados de Conteúdo (JSON)</Label>
              <Textarea
                id={`content-data-${section.id}`}
                defaultValue={JSON.stringify(section.content_data, null, 2)}
                rows={6}
                className="font-mono text-sm"
                onBlur={(e) => {
                  try {
                    const parsedData = JSON.parse(e.target.value);
                    handleSectionUpdate(section.id, { content_data: parsedData });
                  } catch (error) {
                    console.error('Invalid JSON:', error);
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`active-${section.id}`}
                  checked={section.is_active}
                  onCheckedChange={(checked) => {
                    handleSectionUpdate(section.id, { is_active: checked });
                  }}
                />
                <Label htmlFor={`active-${section.id}`}>Seção Ativa</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor={`order-${section.id}`}>Ordem:</Label>
                <Input
                  id={`order-${section.id}`}
                  type="number"
                  defaultValue={section.display_order}
                  className="w-20"
                  onBlur={(e) => {
                    const newOrder = parseInt(e.target.value);
                    if (!isNaN(newOrder) && newOrder !== section.display_order) {
                      handleSectionUpdate(section.id, { display_order: newOrder });
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        )}

        {!isEditing && (
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Título:</strong> {section.title}</p>
              <p><strong>Subtítulo:</strong> {section.subtitle}</p>
              <p><strong>Descrição:</strong> {section.description}</p>
              <p><strong>Ordem:</strong> {section.display_order}</p>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Editor da Landing Page</h1>
          <p className="text-muted-foreground">
            Gerencie o conteúdo de todas as seções da landing page
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="features">Recursos</TabsTrigger>
          <TabsTrigger value="mockups">Mockups</TabsTrigger>
          <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
          <TabsTrigger value="pricing">Preços</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          {renderSectionEditor('hero', 'Seção Principal (Hero)')}
          {renderSectionEditor('final_cta', 'CTA Final')}
        </TabsContent>

        <TabsContent value="personas" className="space-y-6">
          {renderSectionEditor('personas', 'Personas e Histórias')}
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {renderSectionEditor('features', 'Recursos Principais')}
          {renderSectionEditor('security', 'Segurança e Confiança')}
        </TabsContent>

        <TabsContent value="mockups" className="space-y-6">
          {renderSectionEditor('mockups', 'Visualização do Sistema')}
          {renderSectionEditor('how_it_works', 'Como Funciona')}
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          {renderSectionEditor('testimonials', 'Depoimentos de Clientes')}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          {renderSectionEditor('pricing', 'Planos e Preços')}
        </TabsContent>
      </Tabs>

      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            Salvando alterações...
          </div>
        </div>
      )}
    </div>
  );
}