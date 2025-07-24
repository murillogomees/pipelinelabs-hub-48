import React from 'react';

interface AdminPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AdminPageLayout({ title, description, children }: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}