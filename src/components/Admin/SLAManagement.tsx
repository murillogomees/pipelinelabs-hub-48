import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, Users } from 'lucide-react';

export function SLAManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSLA, setNewSLA] = useState({
    title: '',
    version: '',
    content: '',
    effective_date: '',
    is_active: false
  });

  // Fetch SLA agreements using direct query since types not updated yet
  const { data: slaAgreements, isLoading } = useQuery({
    queryKey: ['sla-agreements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sla_agreements' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch SLA acceptance history
  const { data: acceptanceHistory } = useQuery({
    queryKey: ['sla-acceptance-history-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sla_acceptance' as any)
        .select(`
          *,
          companies!inner(name),
          profiles!inner(display_name, email)
        `)
        .order('accepted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create SLA mutation
  const createSLAMutation = useMutation({
    mutationFn: async (slaData: typeof newSLA) => {
      const { data, error } = await supabase
        .from('sla_agreements' as any)
        .insert(slaData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-agreements'] });
      toast({
        title: "SLA Criado",
        description: "Novo acordo de nível de serviço criado com sucesso.",
      });
      setIsDialogOpen(false);
      setNewSLA({
        title: '',
        version: '',
        content: '',
        effective_date: '',
        is_active: false
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar SLA. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Toggle SLA active status
  const toggleSLAMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      // If activating this SLA, deactivate all others first
      if (is_active) {
        await supabase
          .from('sla_agreements' as any)
          .update({ is_active: false })
          .neq('id', id);
      }
      
      const { data, error } = await supabase
        .from('sla_agreements' as any)
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-agreements'] });
      toast({
        title: "SLA Atualizado",
        description: "Status do SLA atualizado com sucesso.",
      });
    },
  });

  const handleCreateSLA = () => {
    createSLAMutation.mutate(newSLA);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de SLA</h2>
          <p className="text-muted-foreground">
            Gerencie acordos de nível de serviço e histórico de aceites
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo SLA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo SLA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newSLA.title}
                    onChange={(e) => setNewSLA(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Acordo de Nível de Serviço"
                  />
                </div>
                <div>
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={newSLA.version}
                    onChange={(e) => setNewSLA(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="effective_date">Data de Vigência</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={newSLA.effective_date}
                  onChange={(e) => setNewSLA(prev => ({ ...prev, effective_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="content">Conteúdo do SLA</Label>
                <Textarea
                  id="content"
                  value={newSLA.content}
                  onChange={(e) => setNewSLA(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Conteúdo completo do SLA em HTML..."
                  rows={10}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={newSLA.is_active}
                  onCheckedChange={(checked) => setNewSLA(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Ativar imediatamente</Label>
              </div>
              <Button 
                onClick={handleCreateSLA} 
                disabled={createSLAMutation.isPending}
                className="w-full"
              >
                {createSLAMutation.isPending ? 'Criando...' : 'Criar SLA'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Acordos de SLA
            </CardTitle>
            <CardDescription>
              Versões dos acordos de nível de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaAgreements?.map((sla: any) => (
                <div key={sla.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{sla.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Versão {sla.version} - {new Date(sla.effective_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={sla.is_active ? 'default' : 'secondary'}>
                      {sla.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Switch
                      checked={sla.is_active}
                      onCheckedChange={(checked) => 
                        toggleSLAMutation.mutate({ id: sla.id, is_active: checked })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Histórico de Aceites
            </CardTitle>
            <CardDescription>
              Empresas que aceitaram os SLAs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acceptanceHistory?.slice(0, 5).map((acceptance: any) => (
                  <TableRow key={acceptance.id}>
                    <TableCell>{acceptance.companies?.name}</TableCell>
                    <TableCell>{acceptance.profiles?.display_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">v{acceptance.sla_version}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(acceptance.accepted_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}