import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Shield, Database, Zap } from 'lucide-react';

export function SistemaTab() {
  const [systemInfo, setSystemInfo] = useState({
    os: 'Linux',
    nodeVersion: '16.13.0',
    dbType: 'PostgreSQL',
    dbVersion: '14.1',
    uptime: '2 days',
    cpuUsage: '30%',
    memoryUsage: '60%',
    diskUsage: '75%',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Sistema Operacional</Label>
            <Input type="text" value={systemInfo.os} readOnly />
          </div>
          <div>
            <Label>Versão do Node.js</Label>
            <Input type="text" value={systemInfo.nodeVersion} readOnly />
          </div>
          <div>
            <Label>Tipo de Banco de Dados</Label>
            <Input type="text" value={systemInfo.dbType} readOnly />
          </div>
          <div>
            <Label>Versão do Banco de Dados</Label>
            <Input type="text" value={systemInfo.dbVersion} readOnly />
          </div>
          <div>
            <Label>Tempo de Atividade</Label>
            <Input type="text" value={systemInfo.uptime} readOnly />
          </div>
          <div>
            <Label>Uso da CPU</Label>
            <Input type="text" value={systemInfo.cpuUsage} readOnly />
          </div>
          <div>
            <Label>Uso da Memória</Label>
            <Input type="text" value={systemInfo.memoryUsage} readOnly />
          </div>
          <div>
            <Label>Uso do Disco</Label>
            <Input type="text" value={systemInfo.diskUsage} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
