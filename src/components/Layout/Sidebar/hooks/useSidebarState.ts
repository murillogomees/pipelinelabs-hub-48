
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { menuItems } from '../constants';

export function useSidebarState() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  // Expande automaticamente apenas o menu ativo e fecha os demais
  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => 
      item.submenu.some(sub => currentPath.startsWith(sub.path)) ||
      currentPath === item.path
    );
    
    if (activeMenuItem && activeMenuItem.submenu.length > 0) {
      // Mantém apenas o item ativo expandido
      setExpandedItems([activeMenuItem.title]);
    } else {
      // Se estamos em uma rota principal sem submenu, fecha todos
      setExpandedItems([]);
    }
  }, [location.pathname]);

  const toggleExpanded = (title: string, collapsed: boolean) => {
    if (collapsed) return;
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return {
    expandedItems,
    toggleExpanded
  };
}
