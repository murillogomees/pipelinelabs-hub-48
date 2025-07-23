import React from 'react';
import { Link } from 'react-router-dom';
export function Footer() {
  return <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">© 2025 Pipeline Labs. Todos os direitos reservados.</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
            <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
            <Link to="/termos-de-uso" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link to="/sla" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              SLA
            </Link>
            <Link to="/app/user/dados-pessoais" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Meus Dados (LGPD)
            </Link>
            <Link to="/app/user/termos-aceitos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Termos Aceitos
            </Link>
          </div>
        </div>
      </div>
    </footer>;
}