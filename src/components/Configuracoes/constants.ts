// Configuration constants and default values

export const FINANCIAL_DEFAULTS = {
  moeda: 'BRL',
  conta_padrao: '',
  categoria_receita: '',
  categoria_despesa: '',
  prazo_pagamento: '',
  formas_pagamento: ['pix', 'cartao', 'boleto', 'dinheiro', 'transferencia']
};

export const FISCAL_DEFAULTS = {
  regime_tributario: '',
  cfop_padrao: '',
  serie_nfe: '',
  ncm_padrao: '',
  tipos_nota: [] as string[],
  impostos: {
    icms: '0',
    ipi: '0', 
    pis: '0',
    cofins: '0'
  }
};

export const SYSTEM_DEFAULTS = {
  crossdocking_padrao: 0,
  estoque_tolerancia_minima: 10,
  funcionalidades: {
    ordem_producao: false,
    ordem_servico: false,
    estoque_avancado: false,
    notas_fiscais: false,
    
  },
  notificacoes: {
    email_vendas: false,
    email_estoque: false,
    email_financeiro: false,
    whatsapp_vendas: false,
    whatsapp_estoque: false
  },
  webhook_url: '',
  webhook_secret: ''
};

export const COMPANY_DEFAULTS = {
  timezone: 'America/Sao_Paulo',
  idioma: 'pt-BR'
};

export const LOADING_MESSAGES = {
  settings: 'Carregando configurações...',
  company: 'Carregando dados da empresa...',
  saving: 'Salvando...'
};

export const SUCCESS_MESSAGES = {
  settings: 'Configurações salvas com sucesso',
  company: 'Dados da empresa atualizados',
  branding: 'Personalização salva e aplicada com sucesso!'
};

export const ERROR_MESSAGES = {
  load: 'Não foi possível carregar as configurações',
  save: 'Não foi possível salvar as configurações',
  domain: 'Por favor, insira um domínio válido',
  whitelabel: 'Seu plano atual não inclui personalização whitelabel'
};