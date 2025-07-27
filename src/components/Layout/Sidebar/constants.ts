import {
  BarChart3,
  Building2,
  Calendar,
  CheckSquare,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Mail,
  MessagesSquare,
  Plus,
  Settings,
  User,
  Users,
  Wallet,
  FileText,
  Search,
} from 'lucide-react';

type Route = {
  title: string;
  path: string;
  icon: LucideIcon;
  description: string;
};

export const appRoutes: Route[] = [
  {
    title: 'Dashboard',
    path: '/app',
    icon: LayoutDashboard,
    description: 'Visão geral da sua empresa',
  },
  {
    title: 'Projetos',
    path: '/app/projetos',
    icon: ListChecks,
    description: 'Gerencie seus projetos',
  },
  {
    title: 'Empresas',
    path: '/app/empresas',
    icon: Building2,
    description: 'Gerencie suas empresas',
  },
  {
    title: 'Leads',
    path: '/app/leads',
    icon: Users,
    description: 'Gerencie seus leads',
  },
  {
    title: 'Financeiro',
    path: '/app/financeiro',
    icon: Wallet,
    description: 'Gerencie suas finanças',
  },
  {
    title: 'Checklist',
    path: '/app/checklist',
    icon: CheckSquare,
    description: 'Gerencie suas checklist',
  },
  {
    title: 'Agenda',
    path: '/app/agenda',
    icon: Calendar,
    description: 'Gerencie sua agenda',
  },
  {
    title: 'Comunicação',
    path: '/app/comunicacao',
    icon: MessagesSquare,
    description: 'Gerencie sua comunicação',
  },
  {
    title: 'Configurações',
    path: '/app/configuracoes',
    icon: Settings,
    description: 'Gerencie as configurações da sua empresa',
  },
];

export const extraRoutes: Route[] = [
  {
    title: 'Criar Projeto',
    path: '/app/projetos/novo',
    icon: Plus,
    description: 'Crie um novo projeto',
  },
  {
    title: 'Criar Empresa',
    path: '/app/empresas/nova',
    icon: Plus,
    description: 'Crie uma nova empresa',
  },
];

export const ADMIN_MENU_ITEMS = [
  {
    title: 'Dashboard',
    icon: 'BarChart3' as any,
    path: '/app/admin',
    description: 'Visão geral do sistema',
  },
  {
    title: 'Usuários',
    icon: 'User' as any,
    path: '/app/admin/usuarios',
    description: 'Gerenciamento de usuários',
  },
  {
    title: 'Logs de Auditoria',
    icon: 'FileText' as any,
    path: '/app/admin/audit-logs',
    description: 'Rastreamento de atividades no sistema',
  },
  {
    title: 'Gerador de Prompts',
    icon: 'Mail' as any,
    path: '/app/admin/prompt-generator',
    description: 'Gere e implemente funcionalidades automaticamente usando IA',
  },
  {
    title: 'Auditoria',
    icon: Search,
    path: '/app/admin/auditoria',
    description: 'Auditoria automática de código',
  },
];

export const PROFILE_MENU_ITEMS = [
  {
    title: 'Perfil',
    icon: User,
    path: '/app/perfil',
    description: 'Visualize e edite seu perfil',
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/app/configuracoes',
    description: 'Gerencie as configurações da sua conta',
  },
];
