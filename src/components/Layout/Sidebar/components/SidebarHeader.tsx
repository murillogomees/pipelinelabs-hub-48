import { Building2 } from 'lucide-react';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({ collapsed }: SidebarHeaderProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 p-4 border-b border-border">
      <div className="p-2 rounded-lg bg-primary/10">
        <Building2 className="h-6 w-6 text-primary" />
      </div>
      {!collapsed && (
        <div>
          <h1 className="font-semibold text-foreground">Pipeline Labs</h1>
          <p className="text-xs text-muted-foreground">ERP Inteligente</p>
        </div>
      )}
    </div>
  );
}