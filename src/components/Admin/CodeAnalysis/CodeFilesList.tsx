import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Edit3, Trash2, Download } from 'lucide-react';

interface CodeFilesListProps {
  fileType: string;
  searchTerm: string;
  basePath: string;
}

interface FileItem {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  isUsed: boolean;
  usageCount: number;
  fileType: string;
  exports: string[];
  imports: string[];
}

export function CodeFilesList({ fileType, searchTerm, basePath }: CodeFilesListProps) {
  // Mock data - em produção viria de uma análise real dos arquivos
  const files: FileItem[] = [
    {
      name: 'Dashboard.tsx',
      path: 'src/pages/Dashboard.tsx',
      size: 8192,
      lastModified: '2024-01-15',
      isUsed: true,
      usageCount: 3,
      fileType: 'page',
      exports: ['Dashboard'],
      imports: ['React', 'Card', 'useDashboard']
    },
    {
      name: 'AdminCodeAnalysis.tsx',
      path: 'src/pages/AdminCodeAnalysis.tsx',
      size: 12288,
      lastModified: '2024-01-15',
      isUsed: true,
      usageCount: 1,
      fileType: 'page',
      exports: ['AdminCodeAnalysis'],
      imports: ['React', 'AdminPageLayout', 'Tabs']
    },
    {
      name: 'OldPage.tsx',
      path: 'src/pages/OldPage.tsx',
      size: 2048,
      lastModified: '2023-11-01',
      isUsed: false,
      usageCount: 0,
      fileType: 'page',
      exports: ['OldPage'],
      imports: ['React']
    }
  ];

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFiles = filteredFiles.filter(f => f.isUsed);
  const unusedFiles = filteredFiles.filter(f => !f.isUsed);

  const getFileTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Arquivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredFiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Em Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeFiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Não Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{unusedFiles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Arquivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getFileTypeIcon(fileType)}
            {fileType.charAt(0).toUpperCase() + fileType.slice(1)}
          </CardTitle>
          <CardDescription>
            Arquivos em {basePath}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFiles.map((file, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileTypeIcon(file.fileType)}
                    <span className="font-medium">{file.name}</span>
                    <div className="flex gap-1">
                      <Badge variant={file.isUsed ? "default" : "destructive"}>
                        {file.isUsed ? `${file.usageCount} usos` : 'Não usado'}
                      </Badge>
                      <Badge variant="outline">{file.fileType}</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    {!file.isUsed && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>{file.path}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span>Tamanho: {(file.size / 1024).toFixed(1)}KB</span>
                    <span>Modificado: {file.lastModified}</span>
                  </div>
                </div>

                <div className="flex space-x-4 text-xs text-muted-foreground">
                  <span>Exports: {file.exports.join(', ')}</span>
                  <span>Imports: {file.imports.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}