
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { menuItems } from '../constants';

export function useSidebarState() {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  // Expande automaticamente apenas o menu ativo e mantém aberto
  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenuItem = menuItems.find(item => 
      item.submenu && item.submenu.some(sub => currentPath.startsWith(sub.path)) ||
      currentPath === item.path
    );
    
    if (activeMenuItem && activeMenuItem.submenu && activeMenuItem.submenu.length > 0) {
      // Sempre mantém o item ativo expandido, mas permite outros também estarem expandidos
      setExpandedItems(prev => {
        if (!prev.includes(activeMenuItem.title)) {
          return [activeMenuItem.title];
        }
        return prev;
      });
    }
  }, [location.pathname]);

  const toggleExpanded = (title: string, collapsed: boolean) => {
    if (collapsed) return;
    
    setExpandedItems(prev => {
      const currentPath = location.pathname;
      const activeMenuItem = menuItems.find(item => 
        item.submenu && item.submenu.some(sub => currentPath.startsWith(sub.path))
      );
      
      if (prev.includes(title)) {
        // Se é o item ativo, não permite fechar
        if (activeMenuItem && activeMenuItem.title === title) {
          return prev;
        }
        return prev.filter(item => item !== title);
      } else {
        return [...prev, title];
      }
    });
  };

  return {
    expandedItems,
    toggleExpanded
  };
}
