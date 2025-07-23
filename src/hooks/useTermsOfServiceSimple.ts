import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TermsOfService {
  id: string;
  title: string;
  content: string;
  version: string;
  effective_date: string;
  is_active: boolean;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

interface TermsAcceptance {
  id: string;
  user_id: string;
  terms_id: string;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
  terms_version: string;
  terms_url?: string;
}

// Temporary simple hook until Supabase types are updated
export function useTermsOfServiceSimple() {
  const { user } = useAuth();
  const [isLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Mock current terms
  const mockTerms: TermsOfService = {
    id: '1',
    title: 'Termos de Uso - Pipeline Labs',
    version: '1.0',
    effective_date: '2024-01-01',
    is_active: true,
    content: `
      <h1>Termos de Uso - Pipeline Labs</h1>
      
      <h2>1. Objetivo do Sistema</h2>
      <p>O Pipeline Labs é um sistema completo de gestão empresarial (ERP) desenvolvido para pequenos empreendedores, oferecendo funcionalidades de:</p>
      <ul>
        <li>Emissão de Notas Fiscais (NFe, NFSe, NFCe)</li>
        <li>Controle de vendas e PDV</li>
        <li>Gestão de estoque</li>
        <li>Controle financeiro e DRE</li>
        <li>Gestão de clientes e fornecedores</li>
        <li>Relatórios e analytics</li>
      </ul>

      <h2>2. Responsabilidades da Empresa</h2>
      <p>A Pipeline Labs se compromete a:</p>
      <ul>
        <li>Manter o sistema funcionando com disponibilidade mínima de 99%</li>
        <li>Proteger os dados dos usuários conforme LGPD</li>
        <li>Realizar backups regulares dos dados</li>
        <li>Fornecer suporte técnico durante horário comercial</li>
        <li>Notificar sobre atualizações e manutenções</li>
      </ul>

      <h2>3. Responsabilidades do Usuário</h2>
      <p>O usuário se compromete a:</p>
      <ul>
        <li>Utilizar o sistema apenas para fins legais</li>
        <li>Manter a confidencialidade de login e senha</li>
        <li>Não compartilhar acesso com terceiros não autorizados</li>
        <li>Manter dados atualizados e corretos</li>
        <li>Cumprir obrigações fiscais e legais</li>
        <li>Pagar as mensalidades em dia</li>
      </ul>

      <h2>4. Limitações de Uso</h2>
      <p>É vedado ao usuário:</p>
      <ul>
        <li>Tentar acessar sistemas ou dados de outros usuários</li>
        <li>Realizar engenharia reversa do software</li>
        <li>Sobrecarregar o sistema com uso excessivo</li>
        <li>Utilizar para atividades ilegais ou fraudulentas</li>
        <li>Revender ou transferir acesso sem autorização</li>
      </ul>

      <h2>5. Suspensão de Contas</h2>
      <p>A conta poderá ser suspensa nos seguintes casos:</p>
      <ul>
        <li>Inadimplência por mais de 15 dias</li>
        <li>Violação dos termos de uso</li>
        <li>Atividades suspeitas ou fraudulentas</li>
        <li>Não colaboração em investigações internas</li>
      </ul>

      <h2>6. Cancelamento de Planos</h2>
      <p>O usuário pode cancelar a qualquer momento:</p>
      <ul>
        <li>Cancelamento efetivo no final do período pago</li>
        <li>Backup dos dados disponível por 30 dias</li>
        <li>Exclusão definitiva após período de retenção</li>
        <li>Sem reembolso de valores já pagos</li>
      </ul>

      <h2>7. Tratamento de Dados</h2>
      <p>Conforme nossa Política de Privacidade:</p>
      <ul>
        <li>Dados tratados apenas para fins do serviço</li>
        <li>Não compartilhamento com terceiros sem consentimento</li>
        <li>Cumprimento integral da LGPD</li>
        <li>Direitos de acesso, correção e exclusão garantidos</li>
      </ul>

      <h2>8. Propriedade Intelectual</h2>
      <p>Todo o conteúdo do sistema é propriedade da Pipeline Labs:</p>
      <ul>
        <li>Código-fonte e algoritmos</li>
        <li>Interface e design</li>
        <li>Marca e logotipos</li>
        <li>Documentação e materiais</li>
      </ul>

      <h2>9. Limitação de Responsabilidade</h2>
      <p>A Pipeline Labs não se responsabiliza por:</p>
      <ul>
        <li>Danos indiretos ou lucros cessantes</li>
        <li>Problemas decorrentes de má utilização</li>
        <li>Falhas de conectividade do usuário</li>
        <li>Decisões tomadas baseadas em relatórios</li>
      </ul>

      <h2>10. Alterações nos Termos</h2>
      <p>Estes termos podem ser alterados:</p>
      <ul>
        <li>Notificação prévia de 30 dias</li>
        <li>Aceite obrigatório para continuar usando</li>
        <li>Direito de cancelamento sem penalidades</li>
      </ul>

      <h2>11. Foro e Legislação</h2>
      <p>Este contrato é regido pela legislação brasileira, elegendo o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>

      <h2>12. Contato</h2>
      <p>Para dúvidas sobre estes termos:</p>
      <ul>
        <li>E-mail: juridico@pipelinelabs.app</li>
        <li>Telefone: (11) 99999-9999</li>
        <li>Endereço: São Paulo, SP - Brasil</li>
      </ul>

      <p><strong>Data de vigência:</strong> 01 de janeiro de 2024</p>
      <p><strong>Versão:</strong> 1.0</p>
    `,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Check if user has accepted current terms (using localStorage for now)
  const hasAcceptedCurrent = () => {
    if (!user) return false;
    const acceptance = localStorage.getItem(`terms_acceptance_${user.id}`);
    if (!acceptance) return false;
    
    const acceptanceData = JSON.parse(acceptance);
    return acceptanceData.version === mockTerms.version;
  };

  // Get user's acceptance record
  const getUserAcceptance = (): TermsAcceptance | null => {
    if (!user) return null;
    const acceptance = localStorage.getItem(`terms_acceptance_${user.id}`);
    if (!acceptance) return null;
    
    return JSON.parse(acceptance);
  };

  // Accept terms
  const acceptTerms = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    setIsAccepting(true);
    try {
      // Get IP address
      let ipAddress = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch (error) {
        console.log('Could not get IP address:', error);
      }

      const acceptance: TermsAcceptance = {
        id: Date.now().toString(),
        user_id: user.id,
        terms_id: mockTerms.id,
        accepted_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        terms_version: mockTerms.version,
        terms_url: window.location.origin + '/termos-de-uso'
      };

      localStorage.setItem(`terms_acceptance_${user.id}`, JSON.stringify(acceptance));

      toast({
        title: "Termos aceitos",
        description: "Aceite registrado com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o aceite dos termos",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    currentTerms: mockTerms,
    userAcceptance: getUserAcceptance(),
    hasAcceptedCurrent: hasAcceptedCurrent(),
    isLoading,
    isAccepting,
    acceptTerms,
  };
}