
import type { LucideIcon } from 'lucide-react';

export interface SubMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  order: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  order: number;
  submenu?: SubMenuItem[];
}
