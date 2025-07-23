import { Building2 } from 'lucide-react';
interface SidebarHeaderProps {
  collapsed: boolean;
}
export function SidebarHeader({
  collapsed
}: SidebarHeaderProps): JSX.Element {
  return <div className="flex items-center gap-2 p-4 border-b border-border">
      
      {!collapsed && <div>
          <h1 className="font-semibold text-foreground">Pipeline Labs</h1>
          
        </div>}
    </div>;
}