-- Insert sample billing plans if they don't exist (using NOT EXISTS)
INSERT INTO public.billing_plans (name, description, price, interval, max_users, features, active)
SELECT 'Básico', 'Perfeito para pequenos negócios iniciantes', 29.90, 'month', 2, '["Até 2 usuários", "Gestão de produtos", "Controle de estoque", "Relatórios básicos", "Suporte por email"]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.billing_plans WHERE name = 'Básico');

INSERT INTO public.billing_plans (name, description, price, interval, max_users, features, active)
SELECT 'Profissional', 'Ideal para empresas em crescimento', 79.90, 'month', 10, '["Até 10 usuários", "Todas as funcionalidades do Básico", "Emissão de NFe", "Gestão financeira", "Integrações com marketplaces", "Relatórios avançados", "Suporte prioritário"]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.billing_plans WHERE name = 'Profissional');

INSERT INTO public.billing_plans (name, description, price, interval, max_users, features, active)
SELECT 'Empresarial', 'Para grandes operações que precisam de máxima performance', 149.90, 'month', NULL, '["Usuários ilimitados", "Todas as funcionalidades do Profissional", "API personalizada", "Backup automático", "Certificado digital", "Suporte 24/7", "Gerente de conta dedicado"]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM public.billing_plans WHERE name = 'Empresarial');