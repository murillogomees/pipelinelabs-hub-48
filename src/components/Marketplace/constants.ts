// Configurações centralizadas dos marketplaces
export const MARKETPLACE_CONFIGS = {
  mercadolivre: {
    name: 'Mercado Livre',
    color: 'bg-yellow-500',
    url: 'https://mercadolivre.com.br',
    auth_type: 'oauth' as const,
    fields: [
      { name: 'app_id', label: 'App ID', type: 'text' },
      { name: 'client_secret', label: 'Client Secret', type: 'password' },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password' },
      { name: 'seller_id', label: 'Seller ID', type: 'text' }
    ]
  },
  shopee: {
    name: 'Shopee',
    color: 'bg-orange-500',
    url: 'https://shopee.com.br',
    auth_type: 'apikey' as const,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'secret_key', label: 'Secret Key', type: 'password' },
      { name: 'shop_id', label: 'Shop ID', type: 'text' },
      { name: 'environment', label: 'Ambiente', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  amazon: {
    name: 'Amazon',
    color: 'bg-orange-600',
    url: 'https://amazon.com.br',
    auth_type: 'apikey' as const,
    fields: [
      { name: 'access_key_id', label: 'Access Key ID', type: 'password' },
      { name: 'secret_access_key', label: 'Secret Access Key', type: 'password' },
      { name: 'marketplace_id', label: 'Marketplace ID', type: 'text' },
      { name: 'seller_id', label: 'Seller ID', type: 'text' }
    ]
  },
  magalu: {
    name: 'Magalu Marketplace',
    color: 'bg-blue-600',
    url: 'https://marketplace.magazineluiza.com.br',
    auth_type: 'apikey' as const,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'store_id', label: 'Store ID', type: 'text' }
    ]
  },
  b2w: {
    name: 'B2W Marketplace',
    color: 'bg-purple-600',
    url: 'https://marketplace.americanas.com',
    auth_type: 'apikey' as const,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'seller_id', label: 'Seller ID', type: 'text' },
      { name: 'environment', label: 'Ambiente', type: 'select', options: ['sandbox', 'production'] }
    ]
  },
  bling: {
    name: 'Bling',
    color: 'bg-green-600',
    url: 'https://bling.com.br',
    auth_type: 'apikey' as const,
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password' },
      { name: 'client_id', label: 'Client ID', type: 'text' }
    ]
  }
} as const;

export type MarketplaceType = keyof typeof MARKETPLACE_CONFIGS;

// Utilitários para status
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return '🟢';
    case 'error': return '🔴';
    default: return '🟡';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success text-success-foreground';
    case 'error': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-warning text-warning-foreground';
  }
};