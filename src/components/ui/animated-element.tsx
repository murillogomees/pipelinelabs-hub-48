import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'fade-in-up' | 'scale-in' | 'slide-in-left' | 'slide-in-right' | 'bounce-subtle';
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedElement({ 
  children, 
  animation = 'fade-in-up', 
  delay = 0, 
  duration = 500,
  className 
}: AnimatedElementProps) {
  const animationClass = `animate-${animation}`;
  
  return (
    <div 
      className={cn(animationClass, className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  animation?: 'fade-in' | 'fade-in-up' | 'scale-in';
  delay?: number;
  className?: string;
}

export function StaggeredList({ 
  children, 
  animation = 'fade-in-up', 
  delay = 100,
  className 
}: StaggeredListProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedElement
          key={index}
          animation={animation}
          delay={index * delay}
          className="opacity-0"
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  );
}