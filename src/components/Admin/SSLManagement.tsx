import { useState } from 'react';
import { useSSLCertificates } from '@/hooks/useSSLCertificates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function SSLManagement() {
  const { certificates, certificateStatus, addCertificate, isAdding } = useSSLCertificates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    domain: '',
    issued_by: '',
    valid_from: '',
    valid_until: '',
    fingerprint: ''
  });

  const handleAddCertificate = () => {
    addCertificate(newCertificate);
    setNewCertificate({
      domain: '',
      issued_by: '',
      valid_from: '',
      valid_until: '',
      fingerprint: ''
    });
    setIsDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expiring':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'valid':
        return 'default';
      case 'expiring':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento SSL/TLS</h2>
          <p className="text-muted-foreground">
            Monitore e gerencie certificados SSL/TLS dos domínios
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Certificado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Certificado SSL</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domínio</Label>
                <Input
                  id="domain"
                  value={newCertificate.domain}
                  onChange={(e) => setNewCertificate(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="issued_by">Emitido por</Label>
                <Input
                  id="issued_by"
                  value={newCertificate.issued_by}
                  onChange={(e) => setNewCertificate(prev => ({ ...prev, issued_by: e.target.value }))}
                  placeholder="Let's Encrypt"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">Válido desde</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={newCertificate.valid_from}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, valid_from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">Válido até</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={newCertificate.valid_until}
                    onChange={(e) => setNewCertificate(prev => ({ ...prev, valid_until: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fingerprint">Fingerprint (opcional)</Label>
                <Input
                  id="fingerprint"
                  value={newCertificate.fingerprint}
                  onChange={(e) => setNewCertificate(prev => ({ ...prev, fingerprint: e.target.value }))}
                  placeholder="SHA-256 fingerprint"
                />
              </div>
              <Button 
                onClick={handleAddCertificate} 
                disabled={isAdding || !newCertificate.domain}
                className="w-full"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar Certificado'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {certificateStatus && Array.isArray(certificateStatus) && (
        <div className="grid gap-4 md:grid-cols-3">
          {certificateStatus.map((cert: any, index: number) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cert.domain}</CardTitle>
                  {getStatusIcon(cert.status)}
                </div>
                <CardDescription>
                  {cert.days_until_expiry > 0 
                    ? `Expira em ${cert.days_until_expiry} dias`
                    : 'Certificado expirado'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={getStatusVariant(cert.status)}>
                  {cert.status === 'valid' && 'Válido'}
                  {cert.status === 'expiring' && 'Expirando'}
                  {cert.status === 'expired' && 'Expirado'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Certificados SSL/TLS</CardTitle>
          <CardDescription>
            Lista completa de certificados monitorados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domínio</TableHead>
                <TableHead>Emitido por</TableHead>
                <TableHead>Válido desde</TableHead>
                <TableHead>Válido até</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates?.map((cert: any) => {
                const isExpiring = new Date(cert.valid_until) < new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
                const isExpired = new Date(cert.valid_until) < new Date();
                
                return (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.domain}</TableCell>
                    <TableCell>{cert.issued_by}</TableCell>
                    <TableCell>{new Date(cert.valid_from).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Date(cert.valid_until).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={isExpired ? 'destructive' : isExpiring ? 'secondary' : 'default'}>
                        {isExpired ? 'Expirado' : isExpiring ? 'Expirando' : 'Válido'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}