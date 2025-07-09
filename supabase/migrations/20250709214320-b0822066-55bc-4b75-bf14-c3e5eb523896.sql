-- Insert sample data into all tables (without profiles and user_companies)
-- This migration creates fictional data for testing and development

-- Insert product categories
INSERT INTO public.product_categories (
  company_id,
  name,
  description
) VALUES 
(
  public.get_default_company_id(),
  'Eletrônicos',
  'Produtos eletrônicos e tecnologia'
),
(
  public.get_default_company_id(),
  'Roupas',
  'Vestuário e acessórios'
),
(
  public.get_default_company_id(),
  'Casa e Jardim',
  'Produtos para casa e decoração'
);

-- Insert products
INSERT INTO public.products (
  company_id,
  category_id,
  code,
  name,
  description,
  price,
  cost_price,
  weight,
  dimensions,
  barcode,
  ncm_code,
  tax_origin,
  tax_situation,
  stock_quantity,
  min_stock,
  max_stock,
  stock_location,
  is_active
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.product_categories WHERE name = 'Eletrônicos' AND company_id = public.get_default_company_id() LIMIT 1),
  'PROD001',
  'Smartphone XYZ',
  'Smartphone Android com 128GB',
  899.99,
  650.00,
  0.185,
  '15x7x0.8 cm',
  '7898123456789',
  '85171231',
  '0',
  '102',
  50,
  10,
  100,
  'Estoque A1',
  true
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.product_categories WHERE name = 'Roupas' AND company_id = public.get_default_company_id() LIMIT 1),
  'PROD002',
  'Camiseta Básica',
  'Camiseta 100% algodão tamanho M',
  39.90,
  18.50,
  0.200,
  '40x30x2 cm',
  '7898987654321',
  '61091000',
  '0',
  '102',
  200,
  20,
  500,
  'Estoque B2',
  true
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.product_categories WHERE name = 'Casa e Jardim' AND company_id = public.get_default_company_id() LIMIT 1),
  'PROD003',
  'Vaso Decorativo',
  'Vaso de cerâmica branco 30cm',
  89.90,
  45.00,
  1.200,
  '30x30x30 cm',
  '7894561237890',
  '69111000',
  '0',
  '102',
  25,
  5,
  50,
  'Estoque C1',
  true
);

-- Insert customers
INSERT INTO public.customers (
  company_id,
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  customer_type,
  is_active
) VALUES 
(
  public.get_default_company_id(),
  'Carlos Oliveira',
  '123.456.789-00',
  'carlos.oliveira@email.com',
  '(11) 98888-3333',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '01234-567',
  'individual',
  true
),
(
  public.get_default_company_id(),
  'Empresa ABC Ltda',
  '12.345.678/0001-99',
  'contato@empresaabc.com',
  '(11) 3333-4444',
  'Av. Comercial, 456',
  'São Paulo',
  'SP',
  '01234-890',
  'company',
  true
),
(
  public.get_default_company_id(),
  'Maria Silva Santos',
  '987.654.321-11',
  'maria.santos@gmail.com',
  '(11) 99999-5555',
  'Rua das Palmeiras, 789',
  'Rio de Janeiro',
  'RJ',
  '20123-456',
  'individual',
  true
);

-- Insert suppliers
INSERT INTO public.suppliers (
  company_id,
  name,
  document,
  email,
  phone,
  address,
  city,
  state,
  zipcode,
  contact_person,
  is_active
) VALUES 
(
  public.get_default_company_id(),
  'Tech Distribuidora Ltda',
  '98.765.432/0001-11',
  'vendas@techdist.com',
  '(11) 4444-5555',
  'Rua Industrial, 789',
  'São Paulo',
  'SP',
  '04567-123',
  'Roberto Souza',
  true
),
(
  public.get_default_company_id(),
  'Confecções Moderna SA',
  '11.222.333/0001-44',
  'comercial@moderna.com',
  '(11) 5555-6666',
  'Av. Têxtil, 321',
  'São Paulo',
  'SP',
  '05678-456',
  'Ana Costa',
  true
),
(
  public.get_default_company_id(),
  'Decorações Premium Ltda',
  '44.555.666/0001-77',
  'vendas@decorpremium.com',
  '(21) 7777-8888',
  'Rua dos Artesãos, 111',
  'Rio de Janeiro',
  'RJ',
  '20789-123',
  'Pedro Lima',
  true
);

-- Insert sales
INSERT INTO public.sales (
  company_id,
  customer_id,
  sale_number,
  sale_date,
  status,
  subtotal,
  discount,
  shipping_cost,
  total_amount,
  payment_method,
  payment_terms,
  notes
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Carlos Oliveira' AND company_id = public.get_default_company_id() LIMIT 1),
  'VND001',
  CURRENT_DATE - INTERVAL '5 days',
  'delivered',
  939.89,
  39.90,
  15.00,
  914.99,
  'PIX',
  'À vista',
  'Venda realizada com sucesso'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Empresa ABC Ltda' AND company_id = public.get_default_company_id() LIMIT 1),
  'VND002',
  CURRENT_DATE - INTERVAL '2 days',
  'approved',
  199.50,
  0.00,
  20.00,
  219.50,
  'Boleto',
  '30 dias',
  'Pedido empresa parceira'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Maria Silva Santos' AND company_id = public.get_default_company_id() LIMIT 1),
  'VND003',
  CURRENT_DATE - INTERVAL '1 day',
  'pending',
  89.90,
  0.00,
  12.00,
  101.90,
  'Cartão de Crédito',
  'À vista',
  'Compra online'
);

-- Insert sale items
INSERT INTO public.sale_items (
  sale_id,
  product_id,
  quantity,
  unit_price,
  discount,
  total_price
) VALUES 
(
  (SELECT id FROM public.sales WHERE sale_number = 'VND001' LIMIT 1),
  (SELECT id FROM public.products WHERE code = 'PROD001' LIMIT 1),
  1,
  899.99,
  0.00,
  899.99
),
(
  (SELECT id FROM public.sales WHERE sale_number = 'VND001' LIMIT 1),
  (SELECT id FROM public.products WHERE code = 'PROD002' LIMIT 1),
  1,
  39.90,
  39.90,
  39.90
),
(
  (SELECT id FROM public.sales WHERE sale_number = 'VND002' LIMIT 1),
  (SELECT id FROM public.products WHERE code = 'PROD002' LIMIT 1),
  5,
  39.90,
  0.00,
  199.50
),
(
  (SELECT id FROM public.sales WHERE sale_number = 'VND003' LIMIT 1),
  (SELECT id FROM public.products WHERE code = 'PROD003' LIMIT 1),
  1,
  89.90,
  0.00,
  89.90
);

-- Insert accounts payable
INSERT INTO public.accounts_payable (
  company_id,
  supplier_id,
  description,
  amount,
  due_date,
  status,
  category,
  notes
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.suppliers WHERE name = 'Tech Distribuidora Ltda' LIMIT 1),
  'Compra de smartphones',
  3250.00,
  CURRENT_DATE + INTERVAL '15 days',
  'pending',
  'Mercadorias',
  'Pagamento da nota fiscal 12345'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.suppliers WHERE name = 'Confecções Moderna SA' LIMIT 1),
  'Compra de camisetas',
  925.00,
  CURRENT_DATE + INTERVAL '30 days',
  'pending',
  'Mercadorias',
  'Lote de camisetas básicas'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.suppliers WHERE name = 'Decorações Premium Ltda' LIMIT 1),
  'Fornecimento de vasos',
  1125.00,
  CURRENT_DATE + INTERVAL '20 days',
  'pending',
  'Mercadorias',
  'Pedido mensal de decorações'
);

-- Insert accounts receivable
INSERT INTO public.accounts_receivable (
  company_id,
  customer_id,
  sale_id,
  description,
  amount,
  due_date,
  status,
  payment_method,
  notes
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Empresa ABC Ltda' LIMIT 1),
  (SELECT id FROM public.sales WHERE sale_number = 'VND002' LIMIT 1),
  'Venda VND002',
  219.50,
  CURRENT_DATE + INTERVAL '30 days',
  'pending',
  'Boleto',
  'Boleto emitido'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Maria Silva Santos' LIMIT 1),
  (SELECT id FROM public.sales WHERE sale_number = 'VND003' LIMIT 1),
  'Venda VND003',
  101.90,
  CURRENT_DATE + INTERVAL '7 days',
  'pending',
  'Cartão de Crédito',
  'Pagamento com cartão processando'
);

-- Insert invoices
INSERT INTO public.invoices (
  company_id,
  customer_id,
  sale_id,
  invoice_number,
  invoice_type,
  series,
  issue_date,
  total_amount,
  tax_amount,
  status,
  access_key
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Carlos Oliveira' LIMIT 1),
  (SELECT id FROM public.sales WHERE sale_number = 'VND001' LIMIT 1),
  '000000001',
  'NFCe',
  '001',
  CURRENT_DATE - INTERVAL '5 days',
  914.99,
  125.45,
  'issued',
  '35240100000000000000005500010000000011234567890'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Empresa ABC Ltda' LIMIT 1),
  (SELECT id FROM public.sales WHERE sale_number = 'VND002' LIMIT 1),
  '000000002',
  'NFe',
  '001',
  CURRENT_DATE - INTERVAL '2 days',
  219.50,
  35.20,
  'issued',
  '35240100000000000000005500010000000021234567891'
);

-- Insert production orders
INSERT INTO public.production_orders (
  company_id,
  product_id,
  order_number,
  quantity,
  start_date,
  end_date,
  status,
  notes
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.products WHERE code = 'PROD002' LIMIT 1),
  'PROD001',
  100,
  CURRENT_DATE + INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '7 days',
  'planned',
  'Ordem de produção para reposição do estoque'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.products WHERE code = 'PROD003' LIMIT 1),
  'PROD002',
  50,
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '10 days',
  'in_progress',
  'Produção de vasos decorativos'
);

-- Insert service orders
INSERT INTO public.service_orders (
  company_id,
  customer_id,
  order_number,
  description,
  service_type,
  status,
  priority,
  estimated_hours,
  cost,
  price,
  start_date,
  notes
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Carlos Oliveira' LIMIT 1),
  'OS001',
  'Instalação e configuração de sistema',
  'Instalação',
  'in_progress',
  'high',
  4.0,
  150.00,
  300.00,
  CURRENT_DATE,
  'Serviço de instalação completa'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.customers WHERE name = 'Empresa ABC Ltda' LIMIT 1),
  'OS002',
  'Manutenção preventiva',
  'Manutenção',
  'open',
  'medium',
  8.0,
  300.00,
  600.00,
  CURRENT_DATE + INTERVAL '2 days',
  'Manutenção mensal contratada'
);

-- Insert stock movements
INSERT INTO public.stock_movements (
  company_id,
  product_id,
  movement_type,
  quantity,
  reference_type,
  reference_id,
  notes
) VALUES 
(
  public.get_default_company_id(),
  (SELECT id FROM public.products WHERE code = 'PROD001' LIMIT 1),
  'out',
  1,
  'sale',
  (SELECT id FROM public.sales WHERE sale_number = 'VND001' LIMIT 1),
  'Saída por venda VND001'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.products WHERE code = 'PROD002' LIMIT 1),
  'out',
  6,
  'sale',
  (SELECT id FROM public.sales WHERE sale_number = 'VND002' LIMIT 1),
  'Saída por vendas'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.products WHERE code = 'PROD003' LIMIT 1),
  'out',
  1,
  'sale',
  (SELECT id FROM public.sales WHERE sale_number = 'VND003' LIMIT 1),
  'Saída por venda VND003'
),
(
  public.get_default_company_id(),
  (SELECT id FROM public.products WHERE code = 'PROD001' LIMIT 1),
  'in',
  50,
  'purchase',
  NULL,
  'Entrada de estoque - compra'
);

-- Insert integrations
INSERT INTO public.integrations (
  company_id,
  integration_type,
  platform_name,
  api_credentials,
  settings,
  is_active,
  last_sync
) VALUES 
(
  public.get_default_company_id(),
  'marketplace',
  'Mercado Livre',
  '{"app_id": "123456", "secret_key": "encrypted_secret"}',
  '{"auto_sync": true, "sync_interval": 60}',
  true,
  CURRENT_DATE - INTERVAL '1 day'
),
(
  public.get_default_company_id(),
  'shipping',
  'Melhor Envio',
  '{"api_token": "encrypted_token"}',
  '{"default_service": "pac", "auto_label": true}',
  true,
  CURRENT_DATE - INTERVAL '2 hours'
),
(
  public.get_default_company_id(),
  'payment',
  'PagSeguro',
  '{"email": "vendas@pipelinelabs.com.br", "token": "encrypted_token"}',
  '{"webhook_url": "https://sistema.com/webhook", "notification": true}',
  true,
  CURRENT_DATE - INTERVAL '30 minutes'
);