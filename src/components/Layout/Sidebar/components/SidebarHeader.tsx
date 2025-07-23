import { Building2 } from 'lucide-react';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({ collapsed }: SidebarHeaderProps) {

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-foreground">Pipeline Labs</h1>
            <p className="text-xs text-muted-foreground">ERP Inteligente</p>
          </div>
        )}
      </div>
    </div>
  );
}