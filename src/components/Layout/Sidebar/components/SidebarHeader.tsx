import { Building2 } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  const { branding } = useBranding();

  return (
    <div className="p-4 border-b border-sidebar-border">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">{branding.nome_customizado}</h1>
            <p className="text-xs text-sidebar-foreground/60">ERP Inteligente</p>
          </div>
        )}
      </div>
    </div>
  );
}