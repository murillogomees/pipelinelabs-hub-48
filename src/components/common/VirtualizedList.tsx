
import React from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  height?: number;
  className?: string;
}

export function VirtualizedList<T>({ 
  items, 
  renderItem, 
  height = 400, 
  className = '' 
}: VirtualizedListProps<T>) {
  // Simple virtualization implementation without external dependencies
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 50 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = 60; // Estimated item height
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(height / itemHeight) + 5, items.length);
    
    setVisibleRange({ start, end });
  }, [items.length, height]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * 60, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${visibleRange.start * 60}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          {visibleItems.map((item, index) => 
            renderItem(item, visibleRange.start + index)
          )}
        </div>
      </div>
    </div>
  );
}
