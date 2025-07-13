import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Star } from 'lucide-react';

interface ProductImagesFormProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export function ProductImagesForm({ data, onChange }: ProductImagesFormProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const images = data.images ? (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) : [];
  const mainImageUrl = data.main_image_url || '';

  const addImage = () => {
    if (newImageUrl) {
      const updatedImages = [...images, newImageUrl];
      onChange('images', JSON.stringify(updatedImages));
      
      // Se for a primeira imagem, definir como principal
      if (!mainImageUrl) {
        onChange('main_image_url', newImageUrl);
      }
      
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_: any, i: number) => i !== index);
    onChange('images', JSON.stringify(updatedImages));
    
    // Se a imagem removida era a principal, definir a primeira como principal
    if (images[index] === mainImageUrl && updatedImages.length > 0) {
      onChange('main_image_url', updatedImages[0]);
    } else if (updatedImages.length === 0) {
      onChange('main_image_url', '');
    }
  };

  const setMainImage = (imageUrl: string) => {
    onChange('main_image_url', imageUrl);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Imagem Principal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="main_image_url">URL da Imagem Principal</Label>
            <Input
              id="main_image_url"
              type="url"
              value={mainImageUrl}
              onChange={(e) => onChange('main_image_url', e.target.value)}
              placeholder="https://cdn.exemplo.com/produto.jpg"
            />
          </div>
          
          {mainImageUrl && (
            <div className="border rounded-lg p-4">
              <img
                src={mainImageUrl}
                alt="Imagem principal do produto"
                className="w-32 h-32 object-cover rounded-lg mx-auto"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik02NCA5NkM4MC41Njg1IDk2IDk0IDgyLjU2ODUgOTQgNjZDOTQgNDkuNDMxNSA4MC41Njg1IDM2IDY0IDM2QzQ3LjQzMTUgMzYgMzQgNDkuNDMxNSAzNCA2NkMzNCA4Mi41Njg1IDQ3LjQzMTUgOTYgNjQgOTZaIiBzdHJva2U9IiM5Q0E5QjQiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Galeria de Imagens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl: string, index: number) => (
              <div key={index} className="relative border rounded-lg p-2">
                <img
                  src={imageUrl}
                  alt={`Imagem ${index + 1} do produto`}
                  className="w-full h-24 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik02NCA5NkM4MC41Njg1IDk2IDk0IDgyLjU2ODUgOTQgNjZDOTQgNDkuNDMxNSA4MC41Njg1IDM2IDY0IDM2QzQ3LjQzMTUgMzYgMzQgNDkuNDMxNSAzNCA2NkMzNCA4Mi41Njg1IDQ3LjQzMTUgOTYgNjQgOTZaIiBzdHJva2U9IiM5Q0E5QjQiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                  }}
                />
                
                <div className="absolute top-1 right-1 flex space-x-1">
                  <Button
                    variant={imageUrl === mainImageUrl ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMainImage(imageUrl)}
                    className="h-6 w-6 p-0"
                  >
                    <Star className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                {imageUrl === mainImageUrl && (
                  <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="URL da nova imagem"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addImage} disabled={!newImageUrl}>
              <Upload className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Adicione URLs de imagens para criar uma galeria</p>
            <p>• Use o ícone de estrela para definir a imagem principal</p>
            <p>• Formatos suportados: JPG, PNG, WEBP</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}