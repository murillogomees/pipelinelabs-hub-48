import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateAppVersion } from "@/hooks/useAppVersions";
import { Plus } from "lucide-react";

interface CreateVersionDialogProps {
  children?: React.ReactNode;
}

export const CreateVersionDialog = ({ children }: CreateVersionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    version_number: '',
    git_sha: '',
    git_branch: '',
    environment: 'preview' as 'production' | 'staging' | 'preview',
    deployed_by: '',
    release_notes: '',
  });

  const createVersionMutation = useCreateAppVersion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.version_number || !formData.git_sha || !formData.git_branch) {
      return;
    }

    try {
      await createVersionMutation.mutateAsync({
        version_number: formData.version_number,
        git_sha: formData.git_sha,
        git_branch: formData.git_branch,
        environment: formData.environment,
        deployed_by: formData.deployed_by || undefined,
        release_notes: formData.release_notes || undefined,
      });

      setOpen(false);
      setFormData({
        version_number: '',
        git_sha: '',
        git_branch: '',
        environment: 'preview',
        deployed_by: '',
        release_notes: '',
      });
    } catch (error) {
      console.error('Erro ao criar versão:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Versão
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Versão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="version_number">Número da Versão *</Label>
            <Input
              id="version_number"
              placeholder="1.0.0"
              value={formData.version_number}
              onChange={(e) => setFormData(prev => ({ ...prev, version_number: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="git_sha">Git SHA *</Label>
            <Input
              id="git_sha"
              placeholder="abc123..."
              value={formData.git_sha}
              onChange={(e) => setFormData(prev => ({ ...prev, git_sha: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="git_branch">Branch *</Label>
            <Input
              id="git_branch"
              placeholder="main"
              value={formData.git_branch}
              onChange={(e) => setFormData(prev => ({ ...prev, git_branch: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Ambiente</Label>
            <Select 
              value={formData.environment} 
              onValueChange={(value: 'production' | 'staging' | 'preview') => 
                setFormData(prev => ({ ...prev, environment: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">Preview</SelectItem>
                <SelectItem value="staging">Homologação</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployed_by">Deployed por</Label>
            <Input
              id="deployed_by"
              placeholder="Nome do usuário"
              value={formData.deployed_by}
              onChange={(e) => setFormData(prev => ({ ...prev, deployed_by: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="release_notes">Release Notes</Label>
            <Textarea
              id="release_notes"
              placeholder="Descrição das mudanças..."
              value={formData.release_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, release_notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createVersionMutation.isPending}>
              {createVersionMutation.isPending ? 'Criando...' : 'Criar Versão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};