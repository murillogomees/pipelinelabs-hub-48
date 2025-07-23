import { useState } from 'react';

// Temporary simple hook until Supabase types are updated
export function usePrivacyTermsSimple() {
  const [isLoading] = useState(false);

  // Mock privacy terms
  const mockTerms = {
    id: '1',
    title: 'Política de Privacidade',
    version: '1.0',
    effective_date: '2024-01-01',
    is_active: true,
    content: `
      <h2>1. Coleta de Dados</h2>
      <p>Coletamos dados pessoais quando você:</p>
      <ul>
        <li>Cria uma conta em nossa plataforma</li>
        <li>Utiliza nossos serviços</li>
        <li>Entra em contato conosco</li>
      </ul>

      <h2>2. Tipos de Dados Coletados</h2>
      <p>Os dados pessoais que coletamos incluem:</p>
      <ul>
        <li>Nome completo</li>
        <li>E-mail</li>
        <li>CPF/CNPJ</li>
        <li>Telefone</li>
        <li>Endereço</li>
        <li>Dados de navegação e uso da plataforma</li>
      </ul>

      <h2>3. Finalidade do Tratamento</h2>
      <p>Utilizamos seus dados para:</p>
      <ul>
        <li>Prestação dos serviços contratados</li>
        <li>Comunicação sobre produtos e serviços</li>
        <li>Cumprimento de obrigações legais</li>
        <li>Melhoria da experiência do usuário</li>
        <li>Análise de dados para otimização da plataforma</li>
      </ul>

      <h2>4. Base Legal</h2>
      <p>O tratamento de seus dados pessoais é baseado em:</p>
      <ul>
        <li>Consentimento do titular</li>
        <li>Execução de contrato ou procedimentos preliminares</li>
        <li>Cumprimento de obrigação legal</li>
        <li>Legítimo interesse</li>
      </ul>

      <h2>5. Compartilhamento de Dados</h2>
      <p>Seus dados podem ser compartilhados com:</p>
      <ul>
        <li>Prestadores de serviços essenciais</li>
        <li>Autoridades competentes, quando exigido por lei</li>
        <li>Terceiros, mediante seu consentimento expresso</li>
      </ul>

      <h2>6. Segurança dos Dados</h2>
      <p>Implementamos medidas técnicas e administrativas para proteger seus dados, incluindo:</p>
      <ul>
        <li>Criptografia de dados sensíveis</li>
        <li>Controle de acesso restrito</li>
        <li>Monitoramento de segurança contínuo</li>
        <li>Backups regulares</li>
      </ul>

      <h2>7. Retenção de Dados</h2>
      <p>Mantemos seus dados pelo período necessário para as finalidades descritas ou conforme exigido por lei.</p>

      <h2>8. Seus Direitos</h2>
      <p>Você tem o direito de:</p>
      <ul>
        <li>Confirmar a existência de tratamento</li>
        <li>Acessar seus dados</li>
        <li>Corrigir dados incompletos ou inexatos</li>
        <li>Solicitar anonimização, bloqueio ou eliminação</li>
        <li>Solicitar portabilidade dos dados</li>
        <li>Obter informações sobre compartilhamento</li>
        <li>Revogar o consentimento</li>
      </ul>

      <h2>9. Contato</h2>
      <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política:</p>
      <ul>
        <li>E-mail: privacidade@pipelinelabs.app</li>
        <li>Telefone: (11) 99999-9999</li>
        <li>Endereço: São Paulo, SP - Brasil</li>
      </ul>

      <h2>10. Alterações</h2>
      <p>Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas.</p>
    `,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    terms: mockTerms,
    allTerms: [mockTerms],
    isLoading,
    isLoadingAll: isLoading,
    updateTerms: () => {},
    isUpdating: false,
  };
}