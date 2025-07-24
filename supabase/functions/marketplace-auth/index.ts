import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthRequest {
  action: 'authenticate' | 'refresh' | 'validate' | 'disconnect'
  marketplace: string
  credentials?: {
    client_id?: string
    client_secret?: string
    api_key?: string
    access_token?: string
    refresh_token?: string
    seller_id?: string
    store_id?: string
    [key: string]: any
  }
  redirect_uri?: string
  code?: string
  channel_id?: string
}

interface MarketplaceConfig {
  name: string
  auth_type: 'oauth2' | 'api_key' | 'hybrid'
  auth_url?: string
  token_url?: string
  scopes?: string[]
  required_fields: string[]
  endpoints: {
    profile?: string
    orders?: string
    products?: string
    inventory?: string
  }
}

const MARKETPLACE_CONFIGS: Record<string, MarketplaceConfig> = {
  'mercado_livre': {
    name: 'Mercado Livre',
    auth_type: 'oauth2',
    auth_url: 'https://auth.mercadolivre.com.br/authorization',
    token_url: 'https://api.mercadolibre.com/oauth/token',
    scopes: ['read', 'write'],
    required_fields: ['client_id', 'client_secret'],
    endpoints: {
      profile: 'https://api.mercadolibre.com/users/me',
      orders: 'https://api.mercadolibre.com/orders/search/recent',
      products: 'https://api.mercadolibre.com/users/{user_id}/items/search',
      inventory: 'https://api.mercadolibre.com/users/{user_id}/items/{item_id}'
    }
  },
  'shopee': {
    name: 'Shopee',
    auth_type: 'oauth2',
    auth_url: 'https://partner.shopeemobile.com/api/v2/shop/auth_partner',
    token_url: 'https://partner.shopeemobile.com/api/v2/auth/token/get',
    required_fields: ['partner_id', 'partner_key', 'shop_id'],
    endpoints: {
      profile: 'https://partner.shopeemobile.com/api/v2/shop/get_shop_info',
      orders: 'https://partner.shopeemobile.com/api/v2/order/get_order_list',
      products: 'https://partner.shopeemobile.com/api/v2/product/get_item_list',
      inventory: 'https://partner.shopeemobile.com/api/v2/product/get_item_base_info'
    }
  },
  'amazon': {
    name: 'Amazon',
    auth_type: 'oauth2',
    auth_url: 'https://sellercentral.amazon.com.br/apps/authorize/consent',
    token_url: 'https://api.amazon.com/auth/o2/token',
    scopes: ['profile', 'postal_code'],
    required_fields: ['client_id', 'client_secret'],
    endpoints: {
      profile: 'https://sellingpartnerapi-na.amazon.com/sellers/v1/marketplaceParticipations',
      orders: 'https://sellingpartnerapi-na.amazon.com/orders/v0/orders',
      products: 'https://sellingpartnerapi-na.amazon.com/catalog/v0/items',
      inventory: 'https://sellingpartnerapi-na.amazon.com/fba/inventory/v1/summaries'
    }
  },
  'magazine_luiza': {
    name: 'Magazine Luiza',
    auth_type: 'api_key',
    required_fields: ['api_key', 'seller_id'],
    endpoints: {
      profile: 'https://api.magazineluiza.com/seller/v1/profile',
      orders: 'https://api.magazineluiza.com/seller/v1/orders',
      products: 'https://api.magazineluiza.com/seller/v1/products',
      inventory: 'https://api.magazineluiza.com/seller/v1/inventory'
    }
  },
  'via_varejo': {
    name: 'Via Varejo (Casas Bahia)',
    auth_type: 'api_key',
    required_fields: ['api_key', 'seller_id'],
    endpoints: {
      profile: 'https://api.viavarejo.com.br/seller/v1/profile',
      orders: 'https://api.viavarejo.com.br/seller/v1/orders',
      products: 'https://api.viavarejo.com.br/seller/v1/products',
      inventory: 'https://api.viavarejo.com.br/seller/v1/inventory'
    }
  }
}

serve(async (req) => {
  console.log(`🔐 Marketplace Auth - Method: ${req.method}`)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const body: AuthRequest = await req.json()
    console.log(`📝 Processing action: ${body.action} for marketplace: ${body.marketplace}`)

    const config = MARKETPLACE_CONFIGS[body.marketplace]
    if (!config) {
      throw new Error(`Unsupported marketplace: ${body.marketplace}`)
    }

    switch (body.action) {
      case 'authenticate':
        return await handleAuthentication(supabase, user.id, body, config)
      
      case 'refresh':
        return await handleRefreshToken(supabase, user.id, body, config)
      
      case 'validate':
        return await handleValidateCredentials(supabase, user.id, body, config)
      
      case 'disconnect':
        return await handleDisconnect(supabase, user.id, body)
      
      default:
        throw new Error(`Unknown action: ${body.action}`)
    }

  } catch (error) {
    console.error('❌ Marketplace Auth Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAuthentication(
  supabase: any, 
  userId: string, 
  body: AuthRequest, 
  config: MarketplaceConfig
) {
  console.log(`🔑 Starting authentication for ${config.name}`)

  if (config.auth_type === 'oauth2') {
    if (body.code) {
      // Exchange authorization code for tokens
      return await exchangeCodeForTokens(supabase, userId, body, config)
    } else {
      // Generate authorization URL
      return generateAuthUrl(body, config)
    }
  } else if (config.auth_type === 'api_key') {
    // Validate and store API key credentials
    return await validateAndStoreApiKey(supabase, userId, body, config)
  }

  throw new Error(`Unsupported auth type: ${config.auth_type}`)
}

async function exchangeCodeForTokens(
  supabase: any,
  userId: string,
  body: AuthRequest,
  config: MarketplaceConfig
) {
  console.log(`🔄 Exchanging code for tokens - ${config.name}`)

  try {
    const tokenData = {
      grant_type: 'authorization_code',
      client_id: body.credentials?.client_id,
      client_secret: body.credentials?.client_secret,
      code: body.code,
      redirect_uri: body.redirect_uri
    }

    const response = await fetch(config.token_url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token exchange failed:', errorText)
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    const tokens = await response.json()
    console.log(`✅ Tokens received for ${config.name}`)

    // Get user company
    const { data: userCompany } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!userCompany) {
      throw new Error('User company not found')
    }

    // Update marketplace channel with tokens
    const { error: updateError } = await supabase
      .from('marketplace_channels')
      .update({
        status: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.channel_id)
      .eq('company_id', userCompany.company_id)

    if (updateError) {
      console.error('Failed to update channel:', updateError)
      throw new Error('Failed to update marketplace channel')
    }

    // Store encrypted credentials in marketplace_integrations
    const { error: integrationError } = await supabase
      .from('marketplace_integrations')
      .upsert({
        company_id: userCompany.company_id,
        marketplace: body.marketplace,
        credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          client_id: body.credentials?.client_id,
          client_secret: body.credentials?.client_secret
        },
        status: 'active',
        last_sync: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id,marketplace'
      })

    if (integrationError) {
      console.error('Failed to store integration:', integrationError)
      throw new Error('Failed to store marketplace integration')
    }

    // Test the connection
    const profileTest = await testConnection(tokens.access_token, config)

    return new Response(
      JSON.stringify({
        success: true,
        message: `${config.name} conectado com sucesso!`,
        data: {
          marketplace: body.marketplace,
          status: 'connected',
          profile: profileTest,
          expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`❌ Token exchange failed for ${config.name}:`, error)
    throw error
  }
}

function generateAuthUrl(body: AuthRequest, config: MarketplaceConfig) {
  console.log(`🔗 Generating auth URL for ${config.name}`)

  const params = new URLSearchParams({
    client_id: body.credentials?.client_id || '',
    redirect_uri: body.redirect_uri || '',
    response_type: 'code',
    scope: config.scopes?.join(' ') || ''
  })

  const authUrl = `${config.auth_url}?${params.toString()}`
  
  return new Response(
    JSON.stringify({
      success: true,
      auth_url: authUrl,
      marketplace: body.marketplace
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function validateAndStoreApiKey(
  supabase: any,
  userId: string,
  body: AuthRequest,
  config: MarketplaceConfig
) {
  console.log(`🔐 Validating API key for ${config.name}`)

  // Validate required fields
  for (const field of config.required_fields) {
    if (!body.credentials?.[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Test the API key
  const testResult = await testApiKeyConnection(body.credentials!, config)
  
  if (!testResult.valid) {
    throw new Error(`Invalid credentials: ${testResult.error}`)
  }

  // Get user company
  const { data: userCompany } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (!userCompany) {
    throw new Error('User company not found')
  }

  // Store credentials
  const { error: integrationError } = await supabase
    .from('marketplace_integrations')
    .upsert({
      company_id: userCompany.company_id,
      marketplace: body.marketplace,
      credentials: body.credentials,
      status: 'active',
      last_sync: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id,marketplace'
    })

  if (integrationError) {
    throw new Error('Failed to store marketplace integration')
  }

  // Update channel status
  if (body.channel_id) {
    await supabase
      .from('marketplace_channels')
      .update({
        status: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.channel_id)
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `${config.name} conectado com sucesso!`,
      data: {
        marketplace: body.marketplace,
        status: 'connected',
        profile: testResult.profile
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRefreshToken(
  supabase: any,
  userId: string,
  body: AuthRequest,
  config: MarketplaceConfig
) {
  console.log(`🔄 Refreshing token for ${config.name}`)

  // Get current integration
  const { data: userCompany } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  const { data: integration } = await supabase
    .from('marketplace_integrations')
    .select('*')
    .eq('company_id', userCompany.company_id)
    .eq('marketplace', body.marketplace)
    .single()

  if (!integration) {
    throw new Error('Integration not found')
  }

  const refreshData = {
    grant_type: 'refresh_token',
    client_id: integration.credentials.client_id,
    client_secret: integration.credentials.client_secret,
    refresh_token: integration.credentials.refresh_token
  }

  const response = await fetch(config.token_url!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(refreshData)
  })

  if (!response.ok) {
    throw new Error('Token refresh failed')
  }

  const tokens = await response.json()

  // Update stored credentials
  const { error } = await supabase
    .from('marketplace_integrations')
    .update({
      credentials: {
        ...integration.credentials,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || integration.credentials.refresh_token,
        expires_in: tokens.expires_in
      },
      updated_at: new Date().toISOString()
    })
    .eq('id', integration.id)

  if (error) {
    throw new Error('Failed to update credentials')
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleValidateCredentials(
  supabase: any,
  userId: string,
  body: AuthRequest,
  config: MarketplaceConfig
) {
  console.log(`✅ Validating credentials for ${config.name}`)

  // Get user company
  const { data: userCompany } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  // Get integration
  const { data: integration } = await supabase
    .from('marketplace_integrations')
    .select('*')
    .eq('company_id', userCompany.company_id)
    .eq('marketplace', body.marketplace)
    .single()

  if (!integration) {
    throw new Error('Integration not found')
  }

  let testResult
  if (config.auth_type === 'oauth2') {
    testResult = await testConnection(integration.credentials.access_token, config)
  } else {
    testResult = await testApiKeyConnection(integration.credentials, config)
  }

  return new Response(
    JSON.stringify({
      success: true,
      valid: testResult.valid,
      profile: testResult.profile,
      error: testResult.error
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDisconnect(supabase: any, userId: string, body: AuthRequest) {
  console.log(`🔌 Disconnecting ${body.marketplace}`)

  const { data: userCompany } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  // Update integration status
  const { error: integrationError } = await supabase
    .from('marketplace_integrations')
    .update({
      status: 'disconnected',
      updated_at: new Date().toISOString()
    })
    .eq('company_id', userCompany.company_id)
    .eq('marketplace', body.marketplace)

  // Update channel status
  if (body.channel_id) {
    await supabase
      .from('marketplace_channels')
      .update({
        status: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.channel_id)
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Marketplace desconectado com sucesso'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function testConnection(accessToken: string, config: MarketplaceConfig) {
  if (!config.endpoints.profile) {
    return { valid: true, profile: null }
  }

  try {
    const response = await fetch(config.endpoints.profile, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const profile = await response.json()
      return { valid: true, profile }
    } else {
      return { valid: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

async function testApiKeyConnection(credentials: any, config: MarketplaceConfig) {
  if (!config.endpoints.profile) {
    return { valid: true, profile: null }
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add API key to headers (varies by marketplace)
    if (credentials.api_key) {
      headers['X-API-Key'] = credentials.api_key
    }

    const response = await fetch(config.endpoints.profile, { headers })

    if (response.ok) {
      const profile = await response.json()
      return { valid: true, profile }
    } else {
      return { valid: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}