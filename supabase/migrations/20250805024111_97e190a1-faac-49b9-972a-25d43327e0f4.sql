-- FASE 1: Correções Críticas - Primeira Parte (Dados Órfãos)

-- 1. Criar empresas faltantes para corrigir dados órfãos
INSERT INTO public.companies (id, name, document, created_at, updated_at) VALUES
('27986ce1-0799-4ad2-8a39-652efd78ff71', 'Empresa Órfã 1', '00000000000001', now(), now()),
('52d055d5-fc99-4c1a-84b6-a026dffe3182', 'Empresa Órfã 2', '00000000000002', now(), now()),
('5dc4860a-88ef-4347-b99f-c4f4f0ebaefb', 'Empresa Órfã 3', '00000000000003', now(), now()),
('860552cc-0cfa-4b16-9218-cfe2953667f0', 'Empresa Órfã 4', '00000000000004', now(), now()),
('f13db2aa-ef74-4dde-9bf7-e935acd99abe', 'Empresa Órfã 5', '00000000000005', now(), now()),
('f60e6b10-32ea-4d8a-b57f-ae328aeb1c38', 'Empresa Órfã 6', '00000000000006', now(), now())
ON CONFLICT (id) DO NOTHING;