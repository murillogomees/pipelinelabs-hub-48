import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';

interface SidebarHeaderProps {
  collapsed: boolean;
}

export function SidebarHeader({
  collapsed
}: SidebarHeaderProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 p-4 border-b border-border">
      {!collapsed && (
        <PipelineLabsLogo size="md" showText={true} />
      )}
      
      {collapsed && (
        <div className="flex justify-center">
          <PipelineLabsLogo size="sm" showText={false} iconOnly={true} />
        </div>
      )}
    </div>
  );
}